-- Create keywords table
CREATE TABLE IF NOT EXISTS keywords (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    word text NOT NULL,
    count integer NOT NULL,
    sentiment text NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    place_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create index on place_id for faster lookups
CREATE INDEX IF NOT EXISTS keywords_place_id_idx ON keywords(place_id);

-- Create a unique constraint to prevent duplicate keywords for the same place
ALTER TABLE keywords 
ADD CONSTRAINT keywords_unique_word 
UNIQUE (place_id, word);

-- Enable Row Level Security (RLS)
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all users to read keywords
CREATE POLICY "Allow public read access"
    ON keywords FOR SELECT
    USING (true);

-- Create a policy that allows authenticated users to insert keywords
CREATE POLICY "Allow authenticated insert"
    ON keywords FOR INSERT
    WITH CHECK (auth.role() = 'authenticated'); 