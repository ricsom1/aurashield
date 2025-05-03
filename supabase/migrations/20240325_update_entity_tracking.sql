-- Drop existing tables if they exist
DROP TABLE IF EXISTS tracked_entities CASCADE;
DROP TYPE IF EXISTS entity_type CASCADE;

-- Create enum type for entity types
CREATE TYPE entity_type AS ENUM ('reddit', 'keyword');

-- Create tracked_entities table
CREATE TABLE tracked_entities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type entity_type NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add constraints
    CONSTRAINT valid_value CHECK (
        CASE 
            WHEN type = 'reddit' THEN value ~ '^[A-Za-z0-9_-]+$'  -- Valid Reddit username chars
            ELSE LENGTH(value) >= 2  -- Minimum 2 chars for keywords
        END
    )
);

-- Create index for faster lookups
CREATE INDEX idx_tracked_entities_user_id ON tracked_entities(user_id);

-- Add RLS policies
ALTER TABLE tracked_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tracked entities"
    ON tracked_entities FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracked entities"
    ON tracked_entities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracked entities"
    ON tracked_entities FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracked entities"
    ON tracked_entities FOR DELETE
    USING (auth.uid() = user_id);

-- Add function to get tracked entities for a user
CREATE OR REPLACE FUNCTION get_user_tracked_entities()
RETURNS TABLE (
    id UUID,
    type entity_type,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        te.id,
        te.type,
        te.value,
        te.created_at
    FROM tracked_entities te
    WHERE te.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to check if an entity is already tracked
CREATE OR REPLACE FUNCTION is_entity_tracked(
    p_type entity_type,
    p_value TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM tracked_entities
        WHERE user_id = auth.uid()
        AND type = p_type
        AND value = p_value
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to track a new entity
CREATE OR REPLACE FUNCTION track_entity(
    p_type entity_type,
    p_value TEXT
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    -- Check if entity is already tracked
    IF is_entity_tracked(p_type, p_value) THEN
        RAISE EXCEPTION 'Entity already tracked';
    END IF;

    -- Insert new entity
    INSERT INTO tracked_entities (user_id, type, value)
    VALUES (auth.uid(), p_type, p_value)
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to untrack an entity
CREATE OR REPLACE FUNCTION untrack_entity(
    p_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM tracked_entities
    WHERE id = p_id
    AND user_id = auth.uid();

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 