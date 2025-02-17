import { supabase } from '../../supabaseClient'

export class MemberModel {
  /**
   * Adds a member to a group with a specific role
   * @param {Object} memberData
   * @param {string} memberData.groupId - The group UUID
   * @param {string} memberData.userId - The user's ID
   * @param {string} memberData.role - Role in the group ('admin' or 'member')
   * @returns {Promise<Object>} The created member data or error
   */
  static async create(memberData) {
    try {
      // Validate role
      if (!['admin', 'member'].includes(memberData.role)) {
        throw new Error('Invalid role. Must be either "admin" or "member"');
      }

      const { data, error } = await supabase
        .from('members')
        .insert([{
          group_id: memberData.groupId,
          user_id: memberData.userId,
          role: memberData.role
        }])
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Gets all members in a group
   * @param {string} groupId - The group UUID
   * @returns {Promise<Object>} Array of member data or error
   */
  static async getByGroupId(groupId) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Gets all groups and roles for a user
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} Array of member data with group info or error
   */
  static async getUserMemberships(userId) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select(`
          id,
          user_id,
          role,
          created_at,
          group:groups (
            id,
            name,
            created_at,
            team:teams (
              id,
              name,
              created_at
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Updates a member's role in a group
   * @param {Object} memberData
   * @param {string} memberData.groupId - The group UUID
   * @param {string} memberData.userId - The user's ID
   * @param {string} memberData.role - New role ('admin' or 'member')
   * @returns {Promise<Object>} The updated member data or error
   */
  static async updateRole(memberData) {
    try {
      // Validate role
      if (!['admin', 'member'].includes(memberData.role)) {
        throw new Error('Invalid role. Must be either "admin" or "member"');
      }

      const { data, error } = await supabase
        .from('members')
        .update({ role: memberData.role })
        .eq('group_id', memberData.groupId)
        .eq('user_id', memberData.userId)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Removes a member from a group
   * @param {string} groupId - The group UUID
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} Success status or error
   */
  static async remove(groupId, userId) {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }
}
