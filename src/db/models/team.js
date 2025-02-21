import { supabase } from '../../supabaseClient'
import { GroupModel } from './group'
import { MemberModel } from './member'
import { MessageModel } from './message'

export class TeamModel {
  static serverChecked = false;
  static serverAvailable = false;
  static API_BASE_URL = '/api';  // Changed to relative path for both dev and prod

  static async checkServer() {
    if (this.serverChecked) {
      return this.serverAvailable;
    }

    try {
      console.log('TeamModel: Checking API server availability...');
      const response = await fetch(`${this.API_BASE_URL}/health`);
      const data = await response.json();
      console.log('TeamModel: API server health check response:', data);
      
      this.serverChecked = true;
      this.serverAvailable = response.ok;
      return this.serverAvailable;
    } catch (error) {
      console.error('TeamModel: Server health check failed:', error);
      this.serverChecked = true;
      this.serverAvailable = false;
      return false;
    }
  }

  /**
   * Search teams by matching vision text against vision-supporter tag descriptions
   * @param {string} visionText - The vision text to match against
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of results per page
   * @returns {Promise<Object>} Matched teams with their vision supporter tags
   */
  static async searchByVisionSupport(visionText, page = 1, limit = 5) {
    try {
      const offset = (page - 1) * limit;

      // Extract keywords from vision text
      console.log('Extracting keywords for:', visionText);
      const response = await fetch(`${this.API_BASE_URL}/extract-keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: visionText })
      });

      if (!response.ok) {
        console.error('Keywords extraction failed:', response.status, response.statusText);
        throw new Error(`Failed to extract keywords: ${response.statusText}`);
      }

      const { keywords } = await response.json();
      if (!keywords) return { data: [] };

      console.log('Using keywords for search:', keywords);

      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          description,
          team_tag_assignments!inner (
            tag_name,
            description
          )
        `)
        .eq('team_tag_assignments.tag_name', 'vision-supporter')
        .textSearch('team_tag_assignments.description', keywords, {
          type: 'websearch',
          config: 'english'
        })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      // Add a basic match score based on the number of matching keywords
      const teamsWithScores = teams.map(team => {
        const supporterTag = team.team_tag_assignments.find(tag => tag.tag_name === 'vision-supporter');
        const description = supporterTag?.description || '';
        const keywordCount = keywords.split(' ').filter(keyword => 
          description.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        const similarity = keywordCount / keywords.split(' ').length; // Simple ratio of matching keywords
        return { ...team, similarity };
      });

      // Sort by match score
      const sortedTeams = teamsWithScores.sort((a, b) => b.similarity - a.similarity);

      return { data: sortedTeams };
    } catch (error) {
      console.error('Error in semantic search:', error);
      return { error: error.message };
    }
  }

  /**
   * Gets all available predefined tags
   * @returns {Promise<Object>} List of available tags
   */
  static async getAvailableTags() {
    try {
      const { data: tags, error } = await supabase
        .from('team_tags')
        .select('name')
        .order('name');

      if (error) throw error;
      
      // Process tags data to ensure correct format
      const processedTags = tags?.map(tag => ({
        name: tag.name
      })) || [];
      
      return processedTags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }

  /**
   * Creates a new team in the database with default groups
   * @param {Object} teamData - The team data to store
   * @param {string} teamData.id - Unique team identifier
   * @param {string} teamData.name - Team display name
   * @param {string} teamData.description - Team description
   * @param {string} teamData.creatorId - User ID of team creator
   * @returns {Promise<Object>} The created team data or error
   */
  static async create(teamData) {
    try {
      if (!teamData.id?.trim() || !teamData.name?.trim()) {
        throw new Error('Team ID and name are required');
      }

      // 1. Ensure user exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', teamData.creatorId)
        .single();

      if (userError) {
        throw new Error('User profile not found. Please ensure you are logged in.');
      }

      // 2. Check if ID already exists
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('id', teamData.id)
        .maybeSingle();

      if (existingTeam) {
        throw new Error('Team ID already exists');
      }

      // Create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert([{
          id: teamData.id,
          name: teamData.name.trim(),
          description: teamData.description?.trim() || null,
          created_by: teamData.creatorId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (teamError) {
        if (teamError.code === '42P01') {
          window.location.href = '/database-setup';
          return { error: 'Database tables not set up. Redirecting to setup page...' };
        }
        throw teamError;
      }

      // Create default groups
      const adminGroup = await GroupModel.create({ teamId: team.id, name: 'admins' });
      const memberGroup = await GroupModel.create({ teamId: team.id, name: 'members' });

      if (adminGroup.error) throw new Error(adminGroup.error);
      if (memberGroup.error) throw new Error(memberGroup.error);

      // Add creator to both groups with admin role
      const adminMember = await MemberModel.create({ groupId: adminGroup.data.id, userId: teamData.creatorId, role: 'admin' });
      const memberMember = await MemberModel.create({ groupId: memberGroup.data.id, userId: teamData.creatorId, role: 'admin' });

      if (adminMember.error) throw new Error(adminMember.error);
      if (memberMember.error) throw new Error(memberMember.error);

      // Add tags if provided
      if (teamData.tags && teamData.tags.length > 0) {
        const { error: tagError } = await supabase
          .from('team_tag_assignments')
          .insert(
            teamData.tags.map(tag => ({
              team_id: team.id,
              tag_name: tag.name,
              description: tag.description
            }))
          );

        if (tagError) throw tagError;
      }

      return {
        data: {
          ...team,
          roles: ['admin'] // Creator is always admin
        }
      };

    } catch (error) {
      // Rollback will happen automatically on error
      return { error: error.message };
    }
  }

  /**
   * Gets a team by its ID with groups and members
   * @param {string} teamId - The team's unique identifier
   * @returns {Promise<Object>} The team data with groups and members, or error
   */
  static async getById(teamId, userId) {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .select(`
          id, 
          name, 
          description, 
          created_at, 
          created_by,
          team_tag_assignments (
            tag_name,
            description
          )
        `)
        .eq('id', teamId)
        .single();

      if (error) throw error;
      
      return {
        data: {
          ...team,
          roles: team.created_by === userId ? ['admin'] : ['member']
        }
      };

    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Gets all teams that the user is a member of through groups
   * @param {string} userId - User ID
   * @returns {Promise<Object>} List of teams with roles and groups
   */
  static async getUserTeams(userId) {
    try {
      // First ensure user exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError) {
        throw new Error('User profile not found. Please ensure you are logged in.');
      }

      // Get all teams and groups the user is a member of
      const { data: memberships, error: membershipError } = await supabase
        .from('members')
        .select(`
          role,
          group:groups (
            id,
            name,
            team:teams (
              id,
              name,
              description,
              created_at,
              created_by
            )
          )
        `)
        .eq('user_id', userId);

      if (membershipError) throw membershipError;

      // Process memberships into teams with groups
      const teamMap = new Map();

      memberships?.forEach(membership => {
        const team = membership.group.team;
        if (!team) return;

        if (!teamMap.has(team.id)) {
          teamMap.set(team.id, {
            ...team,
            roles: new Set(),
            groups: new Set()
          });
        }

        const teamData = teamMap.get(team.id);
        // Add role
        teamData.roles.add(membership.role);
        // Add group
        teamData.groups.add(membership.group);

        // If user is creator, ensure they have admin role
        if (team.created_by === userId) {
          teamData.roles.add('admin');
        }
      });

      // Convert map to array and format the data
      const processedTeams = Array.from(teamMap.values()).map(team => ({
        ...team,
        roles: Array.from(team.roles),
        groups: Array.from(team.groups)
      }));

      return { data: processedTeams };
    } catch (error) {
      return { error: error.message };
    }
  }
}
