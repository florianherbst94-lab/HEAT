-- Create policy to allow all users (anon) to upload to events bucket
CREATE POLICY "Allow public uploads to events bucket"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'events');

-- Create policy to allow all users to read from events bucket
CREATE POLICY "Allow public read access for events bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'events');
