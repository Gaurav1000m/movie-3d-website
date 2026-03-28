-- Create movie_sources table
CREATE TABLE IF NOT EXISTS movie_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tmdb_id TEXT NOT NULL,
    media_type TEXT NOT NULL, -- 'movie' or 'tv'
    title TEXT NOT NULL,
    source_type TEXT NOT NULL, -- 'server', 'external', 'embed', 'direct'
    url TEXT,
    embed_code TEXT,
    poster_path TEXT,
    movie_title TEXT
);

-- Add RLS (Row Level Security) - Adjust policies based on your needs
ALTER TABLE movie_sources ENABLE ROW LEVEL SECURITY;

-- Allow public read (or restrict to authenticated users)
CREATE POLICY "Allow public read of movie_sources" ON movie_sources FOR SELECT USING (true);

-- Allow authenticated admins to manage (This is a simple policy, refine as needed)
CREATE POLICY "Allow service_role to manage movie_sources" ON movie_sources FOR ALL USING (auth.role() = 'service_role');


-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'image', 'video', 'html', 'admob', 'adsterra'
    content TEXT NOT NULL
);

-- Add RLS for ads
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of ads" ON ads FOR SELECT USING (true);
CREATE POLICY "Allow service_role to manage ads" ON ads FOR ALL USING (auth.role() = 'service_role');
