-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from service role
CREATE POLICY "Enable insert for service role" ON reviews
    FOR INSERT 
    WITH CHECK (true);  -- Service role can insert any review

-- Create policy to allow reads for all authenticated users
CREATE POLICY "Enable read access for all users" ON reviews
    FOR SELECT
    USING (true);  -- Anyone can read reviews 