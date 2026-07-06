# Supabase Storage Setup

## Required Buckets

Create these buckets in your Supabase Dashboard:

### 1. `avatars` bucket
- **Name**: `avatars`
- **Public bucket**: ✅ ON (needed for avatar URLs in the UI)
- **File size limit**: 5MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

### 2. `inventory-images` bucket
- **Name**: `inventory-images`
- **Public bucket**: ✅ ON (needed for inventory grid view)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

### RLS Policies

Run this SQL in the Supabase SQL Editor after creating both buckets:

```sql
-- Allow authenticated users to upload to avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to read avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to update/delete their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Inventory images (all staff can upload)
CREATE POLICY "Staff can upload inventory images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'inventory-images');

CREATE POLICY "Anyone can view inventory images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'inventory-images');

CREATE POLICY "Staff can update inventory images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'inventory-images');

CREATE POLICY "Staff can delete inventory images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'inventory-images');
```

---

## After Setup
Redeploy the Vercel production build. Avatar upload and inventory image features will work automatically once the buckets are created.
