-- Criação do bucket para imagens do ministério de mídia
-- Execute este script no SQL Editor do Supabase

-- 1. Cria o bucket para armazenar imagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'midia-images',
  'midia-images',
  true,  -- bucket público para visualização das imagens
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para permitir upload por usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de imagens"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'midia-images');

-- 3. Política para permitir leitura pública das imagens
CREATE POLICY "Imagens são públicas para visualização"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'midia-images');

-- 4. Política para permitir que usuários autenticados deletem suas próprias imagens
CREATE POLICY "Usuários autenticados podem deletar imagens"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'midia-images');

-- 5. Política para permitir que usuários autenticados atualizem imagens
CREATE POLICY "Usuários autenticados podem atualizar imagens"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'midia-images');
