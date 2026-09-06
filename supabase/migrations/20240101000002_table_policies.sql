-- Enable RLS on events table (if not already enabled)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read events
CREATE POLICY "Allow public read access for events"
ON public.events FOR SELECT
TO public
USING (true);

-- Create policy to allow all users to insert events (since we don't have auth yet)
CREATE POLICY "Allow public insert for events"
ON public.events FOR INSERT
TO public
WITH CHECK (true);

-- Create policy to allow all users to update events
CREATE POLICY "Allow public update for events"
ON public.events FOR UPDATE
TO public
USING (true);

-- Create policy to allow all users to delete events
CREATE POLICY "Allow public delete for events"
ON public.events FOR DELETE
TO public
USING (true);
