import { createTeamsTable } from '../db/migrations/01_create_teams';
import { supabase } from '../supabaseClient';

/**
 * Initialize database
 */
export async function initializeDatabase() {
  try {
    // Try to access the teams table to check if it exists
    const { error: checkError } = await supabase
      .from('teams')
      .select('id')
      .limit(1);

    if (checkError?.code === '42P01' || checkError?.message?.includes('relation "teams" does not exist')) {
      console.log('Running database migrations...');
      try {
        // Create database objects
        await createTeamsTable();
      } catch (migrationError) {
        console.error('Migration failed:', migrationError);
        // Show manual setup instructions if migration fails
        console.log('\nTo manually set up the database, run these SQL statements in your Supabase SQL editor:');
        console.log(`
-- Tables
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_group_name_per_team UNIQUE(team_id, name),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_groups_team_id ON groups(team_id);
CREATE INDEX IF NOT EXISTS idx_members_group_id ON members(group_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Teams Policies
CREATE POLICY "Team members can view" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN groups g ON m.group_id = g.id
      WHERE g.team_id = teams.id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can insert" ON teams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      JOIN groups g ON m.group_id = g.id
      WHERE g.team_id = teams.id AND m.user_id = auth.uid() AND m.role = 'admin'
    )
  );

-- Groups Policies
CREATE POLICY "Group members can view" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.group_id = groups.id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage groups" ON groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN groups g ON m.group_id = g.id
      WHERE g.team_id = groups.team_id AND m.user_id = auth.uid() AND m.role = 'admin'
    )
  );

-- Members Policies
CREATE POLICY "Members can view own membership" ON members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team admins can manage members" ON members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN groups g ON m.group_id = g.id
      WHERE g.id = members.group_id AND m.user_id = auth.uid() AND m.role = 'admin'
    )
  );
        `);
      }
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}
