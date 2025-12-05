-- Supabase Storage 정책 설정
-- images 버킷에 대한 RLS 정책

-- 1. 모든 사용자가 이미지 읽기 가능 (public 접근)
CREATE POLICY "Public Access for Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 2. 인증된 사용자만 이미지 업로드 가능
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- 3. 인증된 사용자만 이미지 업데이트 가능
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- 4. 인증된 사용자만 이미지 삭제 가능
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');
