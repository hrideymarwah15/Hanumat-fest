-- ============================================
-- Migration: 011_storage_buckets
-- Description: Storage buckets and policies
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('sport-images', 'sport-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('receipts', 'receipts', false, 1048576, ARRAY['application/pdf']);

-- Sport Images Policies
CREATE POLICY "Anyone can view sport images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'sport-images');

CREATE POLICY "Admins can upload sport images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'sport-images' AND is_admin());

CREATE POLICY "Admins can update sport images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'sport-images' AND is_admin());

CREATE POLICY "Admins can delete sport images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'sport-images' AND is_admin());

-- Avatars Policies
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Receipts Policies
CREATE POLICY "Users can view own receipts"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'receipts' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Only Edge Functions (service_role) can upload receipts
-- This prevents users from uploading fake receipts
CREATE POLICY "System can upload receipts"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'receipts' 
        AND auth.role() = 'service_role'
    );

CREATE POLICY "Admins can view all receipts"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'receipts' AND is_admin());
