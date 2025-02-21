-- Add tsvector columns for full text search
ALTER TABLE teams ADD COLUMN IF NOT EXISTS search_text tsvector;
ALTER TABLE team_tag_assignments ADD COLUMN IF NOT EXISTS search_text tsvector;

-- Create GIN indexes for full text search (better for websearch_to_tsquery)
DROP INDEX IF EXISTS teams_search_idx;
DROP INDEX IF EXISTS team_tags_search_idx;
CREATE INDEX teams_search_idx ON teams USING gin (search_text);
CREATE INDEX team_tags_search_idx ON team_tag_assignments USING gin (search_text);

-- Create function to update search text
CREATE OR REPLACE FUNCTION update_team_search_text() RETURNS trigger AS $$
BEGIN
  NEW.search_text := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_tag_search_text() RETURNS trigger AS $$
BEGIN
  NEW.search_text := setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS teams_search_trigger ON teams;
CREATE TRIGGER teams_search_trigger
  BEFORE INSERT OR UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_team_search_text();

DROP TRIGGER IF EXISTS team_tags_search_trigger ON team_tag_assignments;
CREATE TRIGGER team_tags_search_trigger
  BEFORE INSERT OR UPDATE ON team_tag_assignments
  FOR EACH ROW EXECUTE FUNCTION update_tag_search_text();

-- Update existing data
UPDATE teams SET search_text = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B');

UPDATE team_tag_assignments SET search_text = 
  setweight(to_tsvector('english', COALESCE(description, '')), 'A');
