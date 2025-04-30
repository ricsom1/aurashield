-- Add columns if they don't exist
DO $$ 
BEGIN 
    -- Add author_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'reviews' AND column_name = 'author_name') THEN
        ALTER TABLE reviews ADD COLUMN author_name text;
    END IF;

    -- Add rating column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'reviews' AND column_name = 'rating') THEN
        ALTER TABLE reviews ADD COLUMN rating integer;
    END IF;

    -- Add text column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'reviews' AND column_name = 'text') THEN
        ALTER TABLE reviews ADD COLUMN text text;
    END IF;

    -- Add time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'reviews' AND column_name = 'time') THEN
        ALTER TABLE reviews ADD COLUMN time timestamp with time zone;
    END IF;

    -- Add place_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'reviews' AND column_name = 'place_id') THEN
        ALTER TABLE reviews ADD COLUMN place_id text;
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS reviews_place_id_idx ON reviews(place_id);

-- Add unique constraint for preventing duplicate reviews
DO $$ 
BEGIN 
    -- Drop the constraint if it exists
    ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_unique_review;
    
    -- Create the constraint
    ALTER TABLE reviews
    ADD CONSTRAINT reviews_unique_review 
    UNIQUE (place_id, author_name, time);
EXCEPTION
    WHEN others THEN
        -- If there's an error (like duplicate data), log it
        RAISE NOTICE 'Error creating constraint: %', SQLERRM;
END $$;

-- Make sure RLS is enabled
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Allow public read access" ON reviews;
    DROP POLICY IF EXISTS "Allow authenticated insert" ON reviews;
END $$;

-- Create policies
CREATE POLICY "Allow public read access"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert"
    ON reviews FOR INSERT
    WITH CHECK (auth.role() = 'authenticated'); 