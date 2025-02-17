-- First drop all existing policies
DROP POLICY IF EXISTS "Users can view other users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Teams are viewable by authenticated users" ON teams;
DROP POLICY IF EXISTS "Team creators can manage teams" ON teams;
DROP POLICY IF EXISTS "Teams are manageable by authenticated users" ON teams;
DROP POLICY IF EXISTS "Team admins can manage teams" ON teams;
DROP POLICY IF EXISTS "Group members can view their groups" ON groups;
DROP POLICY IF EXISTS "Team creators can manage groups" ON groups;
DROP POLICY IF EXISTS "Team admins can manage groups" ON groups;
DROP POLICY IF EXISTS "Members can view their own memberships" ON members;
DROP POLICY IF EXISTS "Team creators can manage members" ON members;
DROP POLICY IF EXISTS "Team admins can manage members" ON members;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Simple authenticated access policies
-- Users table policies
CREATE POLICY "Users can view other users"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.role() = 'authenticated' AND auth.uid()::text = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = id);

-- Teams table policies
CREATE POLICY "Teams are viewable by authenticated users"
  ON teams FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Teams are manageable by authenticated users"
  ON teams FOR ALL
  USING (auth.role() = 'authenticated');

-- Groups table policies
CREATE POLICY "Groups are viewable by authenticated users"
  ON groups FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Groups are manageable by authenticated users"
  ON groups FOR ALL
  USING (auth.role() = 'authenticated');

-- Members table policies
CREATE POLICY "Members are viewable by authenticated users"
  ON members FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Members are manageable by authenticated users"
  ON members FOR ALL
  USING (auth.role() = 'authenticated');
