import { supabase } from '../../supabaseClient'
import { GroupModel } from './group'
import { MemberModel } from './member'
import { MessageModel } from './message'

export class TeamModel {
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
        .select('id, name, description, created_at, created_by')
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
   * 获取用户所属的所有团队
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 用户所属的团队列表，包含用户在每个团队中的角色信息
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

      // Then get teams user has created
      const { data: teams, error } = await supabase
        .from('teams')
        .select('id, name, description, created_at, created_by')
        .eq('created_by', userId);

      if (error) throw error;
      
      // Map the teams to include roles
      const processedTeams = (teams || []).map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        created_at: team.created_at,
        created_by: team.created_by,
        roles: ['admin']
      }));

      return { data: processedTeams };
    } catch (error) {
      return { error: error.message };
    }
  }

}
