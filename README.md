# TeamSG Project

## Database Setup

Before using the application, you need to set up the database tables in Supabase. Follow these steps:

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Create a new query and paste the following SQL:

```sql
-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_group_name_per_team UNIQUE(team_id, name),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_groups_team_id ON groups(team_id);
CREATE INDEX IF NOT EXISTS idx_members_group_id ON members(group_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
```

4. Click "Run" to create all the tables and indexes
5. In the "Authentication > Policies" section, add the following Row Level Security (RLS) policies:

```sql
-- Teams policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by team members" ON teams
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM members m
      JOIN groups g ON m.group_id = g.id
      WHERE g.team_id = teams.id
    )
  );

CREATE POLICY "Teams can be created by authenticated users" ON teams
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Groups policies
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Groups are viewable by team members" ON groups
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM members
      WHERE group_id = groups.id
    )
  );

CREATE POLICY "Groups can be created by team admins" ON groups
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM members
      WHERE role = 'admin' AND group_id IN (
        SELECT id FROM groups WHERE team_id = NEW.team_id
      )
    )
  );

-- Members policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members are viewable by team members" ON members
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM members m2
      WHERE m2.group_id IN (
        SELECT g.id FROM groups g
        WHERE g.team_id IN (
          SELECT g2.team_id FROM groups g2
          WHERE g2.id = members.group_id
        )
      )
    )
  );

CREATE POLICY "Members can be created by team admins" ON members
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM members
      WHERE role = 'admin' AND group_id IN (
        SELECT id FROM groups WHERE team_id = (
          SELECT team_id FROM groups WHERE id = NEW.group_id
        )
      )
    )
  );
```

After completing these steps, the database will be properly set up with all required tables, indexes, and security policies.
