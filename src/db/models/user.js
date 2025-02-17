import { supabase } from '../../supabaseClient'

export class UserModel {
  /**
   * Gets a user by their ID
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} The user data or error
   */
  static async getById(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url, created_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Updates a user's profile
   * @param {Object} userData - The user data to update
   * @param {string} userData.id - User ID
   * @param {string} [userData.full_name] - Full name
   * @param {string} [userData.avatar_url] - Avatar URL
   * @returns {Promise<Object>} The updated user data or error
   */
  static async update(userData) {
    try {
      if (!userData.id) {
        throw new Error('User ID is required');
      }

      const updates = {};
      if (userData.full_name !== undefined) updates.full_name = userData.full_name;
      if (userData.avatar_url !== undefined) updates.avatar_url = userData.avatar_url;

      if (Object.keys(updates).length === 0) {
        throw new Error('No fields to update');
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userData.id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Gets multiple users by their IDs
   * @param {string[]} userIds - Array of user IDs
   * @returns {Promise<Object>} Array of user data or error
   */
  static async getByIds(userIds) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .in('id', userIds);

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Lists all users (with pagination)
   * @param {Object} options - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=10] - Items per page
   * @param {string} [options.search] - Search term for email or full name
   * @returns {Promise<Object>} Array of user data or error
   */
  static async list({ page = 1, limit = 10, search } = {}) {
    try {
      let query = supabase
        .from('users')
        .select('id, email, full_name, avatar_url, created_at', { count: 'exact' });

      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data,
        metadata: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}
