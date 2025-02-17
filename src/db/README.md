# 数据库设计文档

## 表结构设计

### teams（团队表）
存储团队的基本信息。
```sql
CREATE TABLE teams (
  id TEXT PRIMARY KEY,            -- 团队唯一标识符
  name TEXT NOT NULL,            -- 团队显示名称
  description TEXT,              -- 团队描述
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL  -- 创建时间
);
```

### groups（组表）
管理团队内的用户组，每个团队默认有 Admins 和 Members 两个组。组使用 UUID 作为主键而不是 teamId_groupName 的组合，原因是：
1. UUID 提供更好的安全性，不暴露内部业务信息
2. 避免组名中特殊字符的处理问题
3. 保持与其他表（messages, members）ID 格式一致
4. 便于未来的数据迁移和合并
5. 性能稳定（固定长度）

虽然 teamId_groupName 的组合更具可读性，但已通过 unique_group_name_per_team 约束确保组名在团队内的唯一性，无需在 ID 层面重复这个约束。
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- 组唯一标识符
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,  -- 所属团队ID
  name TEXT NOT NULL,                             -- 组名称
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_group_name_per_team UNIQUE(team_id, name)   -- 确保组名在团队内唯一
);
```

### members（成员表）
管理用户在组内的成员关系和角色。
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- 成员关系唯一标识符
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,  -- 所属组ID
  user_id TEXT NOT NULL,                         -- 用户ID
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),  -- 用户在组内的角色
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(group_id, user_id)                      -- 用户在同一组中只能有一个角色
);
```

### messages（消息表）
存储组内的各类消息。
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- 消息唯一标识符
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,  -- 所属组ID
  title TEXT NOT NULL,                           -- 消息标题
  text TEXT NOT NULL,                           -- 消息内容
  media JSONB,                                  -- 媒体内容（可选）
  type message_type NOT NULL,                   -- 消息类型
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by TEXT NOT NULL                      -- 消息创建者ID
);

-- 消息类型枚举
CREATE TYPE message_type AS ENUM (
  'system',           -- 系统消息
  'notification',     -- 通知
  'announcement',     -- 公告
  'chat'             -- 聊天消息
);
```

### message_scopes（消息可见范围表）
定义消息的可见范围和规则。
```sql
CREATE TABLE message_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- scope唯一标识符
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,  -- 所属消息ID
  scope_type TEXT NOT NULL,                      -- 范围类型
  scope_value JSONB NOT NULL,                    -- 范围值配置
  CONSTRAINT valid_scope_type CHECK (
    scope_type IN ('all', 'admin', 'member', 'self', 'custom')
  )
);
```

## 消息范围配置

### 基本范围类型（scope_type）
- 'all'：所有人可见
- 'admin'：仅管理员可见
- 'member'：仅普通成员可见
- 'self'：仅创建者可见
- 'custom'：自定义规则

### 自定义范围配置（scope_value）
```json
{
  "groups": ["admins", "members"],    // 允许访问的组
  "apps": ["web", "mobile"],         // 允许访问的应用
  "services": ["chat", "task"],      // 允许访问的服务
  "custom_rules": {                  // 自定义规则
    "role": ["admin"],              // 角色要求
    "department": ["IT", "HR"]      // 部门要求
  }
}
```

## 关系和约束

### 级联删除
- 删除团队时自动删除其下的所有组
- 删除组时自动删除其中的所有成员关系和消息
- 删除消息时自动删除其范围配置

### 唯一性约束
- 团队 ID 全局唯一（`teams.id PRIMARY KEY`）
- 组名在同一团队内唯一（`unique_group_name_per_team`）
- 用户在同一组内只能有一个角色（`UNIQUE(group_id, user_id)`）

### 角色限制
- 成员角色只能是 'admin' 或 'member'（CHECK 约束）
- 消息类型必须是预定义的枚举值之一

## 索引设计

```sql
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_groups_team_id ON groups(team_id);
CREATE INDEX idx_members_group_id ON members(group_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_messages_group_id ON messages(group_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_message_scopes_message_id ON message_scopes(message_id);
```

## 默认数据和自动化

### 创建团队时的自动操作
1. 创建默认组：
   - Admins 组
   - Members 组
2. 设置创建者权限：
   - 添加为两个默认组的管理员
3. 创建欢迎消息：
   - 发送系统类型的欢迎消息
   - 设置消息范围为 'all'

## 示例查询

### 获取团队消息列表

消息显示逻辑：
1. 找到用户在团队中所属的所有组和角色
2. 获取这些组中的所有消息
3. 根据消息的 scope 规则过滤用户可见的消息

```sql
-- 1. 获取用户在团队中的组和角色
WITH user_groups AS (
  SELECT m.role, g.id as group_id, g.name as group_name
  FROM members m
  JOIN groups g ON m.group_id = g.id
  WHERE g.team_id = :teamId 
    AND m.user_id = :userId
)

-- 2. 获取这些组的消息及其scope
SELECT 
  m.*,
  ms.scope_type,
  ms.scope_value,
  g.name as group_name,
  g.team_id
FROM messages m
JOIN groups g ON m.group_id = g.id
JOIN message_scopes ms ON m.id = ms.message_id
WHERE m.group_id IN (SELECT group_id FROM user_groups)
  AND (
    -- 3. 根据scope规则过滤
    ms.scope_type = 'all'
    OR (ms.scope_type = 'admin' AND EXISTS (
      SELECT 1 FROM user_groups ug WHERE ug.role = 'admin'
    ))
    OR (ms.scope_type = 'member' AND EXISTS (
      SELECT 1 FROM user_groups ug WHERE ug.role = 'member'
    ))
    OR (ms.scope_type = 'self' AND m.created_by = :userId)
    OR (ms.scope_type = 'custom' AND EXISTS (
      SELECT 1 FROM user_groups ug 
      WHERE ug.group_name = ANY(ms.scope_value->>'groups')
      OR ug.role = ANY(ms.scope_value->'custom_rules'->>'role')
    ))
  )
ORDER BY m.created_at DESC;
```

注意：实际实现使用了 Supabase 查询并在应用层处理复杂的scope规则，因为某些JSON操作在SQL中不够灵活。

### 消息统计和分析

```sql
-- 按组和消息类型统计
SELECT 
  g.name as group_name,
  m.type,
  COUNT(*) as message_count,
  MIN(m.created_at) as first_message,
  MAX(m.created_at) as last_message
FROM groups g
LEFT JOIN messages m ON g.id = m.group_id
WHERE g.team_id = :teamId
GROUP BY g.name, m.type;

-- 按作者和类型统计
SELECT 
  m.created_by,
  m.type,
  COUNT(*) as message_count,
  COUNT(DISTINCT m.group_id) as groups_count
FROM messages m
JOIN groups g ON m.group_id = g.id
WHERE g.team_id = :teamId
GROUP BY m.created_by, m.type;

-- 按scope类型统计
SELECT 
  ms.scope_type,
  COUNT(*) as message_count,
  COUNT(DISTINCT m.group_id) as groups_count
FROM messages m
JOIN message_scopes ms ON m.id = ms.message_id
JOIN groups g ON m.group_id = g.id
WHERE g.team_id = :teamId
GROUP BY ms.scope_type;
