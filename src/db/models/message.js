import { supabase } from '../../supabaseClient'

export class MessageModel {
  /**
   * 创建一条新消息和其可见范围
   * @param {Object} messageData - 消息数据
   * @param {string} messageData.groupId - 组ID
   * @param {string} messageData.title - 消息标题
   * @param {string} messageData.text - 消息内容
   * @param {Object} [messageData.media] - 媒体内容
   * @param {string} messageData.type - 消息类型 ('system'|'notification'|'announcement'|'chat')
   * @param {string} messageData.createdBy - 创建者ID
   * @param {Object} scopeData - 可见范围数据
   * @param {string} scopeData.type - 范围类型 ('all'|'admin'|'member'|'self'|'custom')
   * @param {Object} scopeData.value - 范围值配置
   * @returns {Promise<Object>} 创建的消息及范围数据
   */
  static async create(messageData, scopeData) {
    try {
      // 开始事务
      const { data: client } = await supabase.rpc('begin_transaction');

      // 1. 创建消息
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert([{
          group_id: messageData.groupId,
          title: messageData.title,
          text: messageData.text,
          media: messageData.media,
          type: messageData.type,
          created_by: messageData.createdBy
        }])
        .select()
        .single();

      if (msgError) throw msgError;

      // 2. 创建消息范围
      const { data: scope, error: scopeError } = await supabase
        .from('message_scopes')
        .insert([{
          message_id: message.id,
          scope_type: scopeData.type,
          scope_value: scopeData.value
        }])
        .select()
        .single();

      if (scopeError) throw scopeError;

      return { data: { ...message, scope } };

    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * 获取用户可见的消息列表
   * @param {Object} params - 查询参数
   * @param {string} params.groupId - 组ID
   * @param {string} params.userId - 用户ID
   * @param {string} params.userRole - 用户角色
   * @param {Object} [params.filters] - 过滤条件
   * @returns {Promise<Object>} 消息列表
   */
  static async getVisible(params) {
    try {
      // 构建基本查询
      let query = supabase
        .from('messages')
        .select(`
          *,
          message_scopes (
            scope_type,
            scope_value
          )
        `)
        .eq('group_id', params.groupId)
        .order('created_at', { ascending: false });

      // 根据scope规则过滤
      // 这里需要在应用层面进行额外的过滤，因为scope_value中的复杂规则
      // 无法直接在数据库层面处理
      const { data: messages, error } = await query;

      if (error) throw error;

      // 过滤出用户可见的消息
      const visibleMessages = messages.filter(message => {
        const scope = message.message_scopes[0];
        
        // 检查基本scope类型
        if (scope.scope_type === 'all') return true;
        if (scope.scope_type === 'self' && message.created_by === params.userId) return true;
        if (scope.scope_type === params.userRole) return true;
        
        // 检查自定义规则
        if (scope.scope_type === 'custom') {
          const rules = scope.scope_value;
          
          // 检查组
          if (rules.groups?.includes(params.userRole)) return true;
          
          // 如果提供了其他过滤条件，检查它们
          if (params.filters) {
            // 检查 app
            if (rules.apps?.includes(params.filters.app)) return true;
            // 检查 service
            if (rules.services?.includes(params.filters.service)) return true;
            // 检查自定义规则
            if (rules.custom_rules) {
              for (const [key, values] of Object.entries(rules.custom_rules)) {
                if (params.filters[key] && values.includes(params.filters[key])) {
                  return true;
                }
              }
            }
          }
        }

        return false;
      });

      return { data: visibleMessages };
      
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * 获取用户在团队中可见的所有消息
   * @param {Object} params - 查询参数
   * @param {string} params.teamId - 团队ID
   * @param {string} params.userId - 用户ID
   * @param {Object} [params.filters] - 过滤条件
   * @returns {Promise<Object>} 消息列表
   */
  static async getTeamMessages(params) {
    try {
      // 1. 获取用户在团队中的所有组和角色信息
      const { data: memberGroups, error: groupError } = await supabase
        .from('members')
        .select(`
          role,
          group:groups (
            id,
            name,
            team_id
          )
        `)
        .eq('user_id', params.userId)
        .filter('group.team_id', 'eq', params.teamId);

      if (groupError) throw groupError;

      if (!memberGroups?.length) {
        return { data: [] }; // 用户不属于这个团队的任何组
      }

      // 收集用户的组ID和角色
      const groupIds = memberGroups.map(mg => mg.group.id);
      const roles = [...new Set(memberGroups.map(mg => mg.role))];
      const groupNames = memberGroups.map(mg => mg.group.name.toLowerCase());

      // 2. 获取这些组的所有消息及其scope
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select(`
          *,
          group:groups!inner (
            name,
            team_id
          ),
          message_scopes (
            scope_type,
            scope_value
          )
        `)
        .in('group_id', groupIds)
        .order('created_at', { ascending: false });

      if (msgError) throw msgError;

      // 3. 根据scope规则过滤消息
      const visibleMessages = messages.filter(message => {
        const scope = message.message_scopes[0];
        
        // 基本scope类型检查
        if (scope.scope_type === 'all') return true;
        if (scope.scope_type === 'self' && message.created_by === params.userId) return true;
        if (scope.scope_type === 'admin' && roles.includes('admin')) return true;
        if (scope.scope_type === 'member' && roles.includes('member')) return true;

        // 自定义规则检查
        if (scope.scope_type === 'custom') {
          const rules = scope.scope_value;

          // 检查组名
          if (rules.groups?.some(g => groupNames.includes(g.toLowerCase()))) return true;

          // 检查角色
          if (rules.custom_rules?.role?.some(r => roles.includes(r))) return true;

          // 检查其他过滤条件
          if (params.filters) {
            if (rules.apps?.includes(params.filters.app)) return true;
            if (rules.services?.includes(params.filters.service)) return true;

            // 检查其他自定义规则
            for (const [key, values] of Object.entries(rules.custom_rules || {})) {
              if (key !== 'role' && params.filters[key] && values.includes(params.filters[key])) {
                return true;
              }
            }
          }
        }

        return false;
      });

      return { data: visibleMessages };

    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Gets a message by ID
   * @param {string} messageId - The message ID
   * @returns {Promise<Object>} The message data with scope info
   */
  static async getById(messageId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          message_scopes (
            scope_type,
            scope_value
          )
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;
      return { data };

    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * 更新消息范围
   * @param {string} messageId - 消息ID
   * @param {Object} scopeData - 新的范围数据
   * @param {string} scopeData.type - 范围类型
   * @param {Object} scopeData.value - 范围值配置
   * @returns {Promise<Object>} 更新后的范围数据
   */
  static async updateScope(messageId, scopeData) {
    try {
      const { data, error } = await supabase
        .from('message_scopes')
        .update({
          scope_type: scopeData.type,
          scope_value: scopeData.value
        })
        .eq('message_id', messageId)
        .select()
        .single();

      if (error) throw error;
      return { data };

    } catch (error) {
      return { error: error.message };
    }
  }
}
