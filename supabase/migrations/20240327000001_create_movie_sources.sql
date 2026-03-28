-- Create movie_sources table
CREATE TABLE IF NOT EXISTS movie_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'server',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_movie_sources_name ON movie_sources(name);
CREATE INDEX IF NOT EXISTS idx_movie_sources_active ON movie_sources(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE movie_sources ENABLE ROW LEVEL SECURITY;

-- Create policy for reading (public access)
CREATE POLICY "Public can view movie sources" ON movie_sources
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create policy for inserting (admin only)
CREATE POLICY "Admin can insert movie sources" ON movie_sources
  FOR INSERT WITH CHECK (auth.uid() = 'gaurav1000m@gmail.com');

-- Create policy for updating (admin only)
CREATE POLICY "Admin can update movie sources" ON movie_sources
  FOR UPDATE WITH CHECK (auth.uid() = 'gaurav1000m@gmail.com');

-- Create policy for deleting (admin only)
CREATE POLICY "Admin can delete movie sources" ON movie_sources
  FOR DELETE WITH CHECK (auth.uid() = 'gaurav1000m@gmail.com');
