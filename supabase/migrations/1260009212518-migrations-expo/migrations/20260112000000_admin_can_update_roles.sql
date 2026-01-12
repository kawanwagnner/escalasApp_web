-- Migration: Permitir que admins atualizem o role de outros usuários
-- Data: 2026-01-12

-- Remove a policy antiga que só permitia atualizar o próprio perfil
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Cria nova policy: usuário pode atualizar seu próprio perfil OU admin pode atualizar qualquer perfil
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id 
    OR 
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    -- Usuário comum só pode atualizar seu próprio perfil (exceto o campo role)
    (auth.uid() = id)
    OR
    -- Admin pode atualizar qualquer perfil (incluindo o role)
    EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Comentário explicativo
COMMENT ON POLICY "profiles_update_own_or_admin" ON public.profiles IS 
  'Permite que usuários atualizem seu próprio perfil e admins atualizem qualquer perfil (incluindo promover/rebaixar roles)';
