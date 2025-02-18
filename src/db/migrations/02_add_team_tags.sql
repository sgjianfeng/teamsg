-- Create table for predefined tags
CREATE TABLE IF NOT EXISTS team_tags (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create table for team tag assignments with descriptions
CREATE TABLE IF NOT EXISTS team_tag_assignments (
    team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
    tag_name TEXT REFERENCES team_tags(name) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (team_id, tag_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_tag_assignments_team_id ON team_tag_assignments(team_id);
CREATE INDEX IF NOT EXISTS idx_team_tag_assignments_tag_name ON team_tag_assignments(tag_name);

-- Insert initial predefined tag
INSERT INTO team_tags (name) VALUES ('vision-supporter') ON CONFLICT DO NOTHING;
