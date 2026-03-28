-- Fix admin access for manage-ads page
-- Update the policy to properly check email from auth.users table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view users" ON auth.users;
DROP POLICY IF EXISTS "Admin can insert users" ON auth.users;
DROP POLICY IF EXISTS "Admin can update users" ON auth.users;
DROP POLICY IF EXISTS "Admin can delete users" ON auth.users;

-- Create proper admin policies
CREATE POLICY "Admin can view users" ON auth.users
  FOR SELECT USING (auth.uid() = 'gaurav1000m@gmail.com');

CREATE POLICY "Admin can insert users" ON auth.users
  FOR INSERT WITH CHECK (auth.uid() = 'gaurav1000m@gmail.com');

CREATE POLICY "Admin can update users" ON auth.users
  FOR UPDATE WITH CHECK (auth.uid() = 'gaurav1000m@gmail.com');

CREATE POLICY "Admin can delete users" ON auth.users
  FOR DELETE WITH CHECK (auth.uid() = 'gaurav1000m@gmail.com');

-- Enable RLS on auth.users if not already enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
