import { supabase } from '../../supabaseClient'

export class GroupModel {
  /**
   * Creates a new group in a team
   * @param {Object} groupData
   * @param {string} groupData.teamId - The team ID this group belongs to
   * @param {string} groupData.name - Group name
   * @returns {Promise<Object>} The created group data or error
   */
  static async create(groupData) {
    try {
      // First check if group name exists in this team
      const { data: existingGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('team_id', groupData.teamId)
        .eq('name', groupData.name)
        .single();

      if (existingGroup) {
        throw new Error(`Group "${groupData.name}" already exists in this team`);
      }

      const { data, error } = await supabase
        .from('groups')
        .insert([{
          team_id: groupData.teamId,
          name: groupData.name
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // unique_violation error code
          throw new Error(`Group "${groupData.name}" already exists in this team`);
        }
        throw error;
      }
      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Gets all groups in a team
   * @param {string} teamId - The team ID
   * @returns {Promise<Object>} Array of group data or error
   */
  static async getByTeamId(teamId) {
    try {
      // First get groups
      const { data: groups, error } = await supabase
        .from('groups')
        .select('id, name, team_id, created_at')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!groups) return { data: [] };

      // Then get members for each group
      const groupsWithMembers = await Promise.all(groups.map(async group => {
        const { data: members } = await supabase
          .from('members')
          .select('id, user_id, role, created_at')
          .eq('group_id', group.id);
          
        return {
          ...group,
          members: members || []
        };
      }));

      return { data: groupsWithMembers };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Gets a group by ID
   * @param {string} groupId - The group's UUID
   * @returns {Promise<Object>} The group data or error
   */
  static async getById(groupId) {
    try {
      // First get group
      const { data: group, error } = await supabase
        .from('groups')
        .select('id, name, team_id, created_at')
        .eq('id', groupId)
        .single();

      if (error) throw error;

      // Then get members
      const { data: members } = await supabase
        .from('members')
        .select('id, user_id, role, created_at')
        .eq('group_id', groupId);

      return {
        data: {
          ...group,
          members: members || []
        }
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}
