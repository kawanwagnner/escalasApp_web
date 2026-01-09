-- =====================================================
-- CORREÇÃO DE PERMISSÕES PARA FUNÇÕES RPC
-- =====================================================
-- Execute este SQL no Editor SQL do Supabase para permitir
-- que usuários anônimos (não autenticados) chamem as funções
-- de verificação de código.
-- =====================================================

-- Permite chamada da função de criar código (anon e authenticated)
GRANT EXECUTE ON FUNCTION create_or_update_verification_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_or_update_verification_code(TEXT) TO authenticated;

-- Permite chamada da função de validar código (anon e authenticated)
GRANT EXECUTE ON FUNCTION validate_verification_code(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION validate_verification_code(TEXT, TEXT) TO authenticated;

-- Permite chamada da função de limpar códigos expirados (anon e authenticated)
GRANT EXECUTE ON FUNCTION cleanup_expired_verification_codes() TO anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_verification_codes() TO authenticated;

-- Permite chamada da função de atualizar senha (via código verificado)
GRANT EXECUTE ON FUNCTION admin_update_user_password(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION admin_update_user_password(TEXT, TEXT) TO authenticated;

-- Permite acesso à tabela para leitura e deleção
GRANT SELECT ON public.verification_codes TO anon;
GRANT DELETE ON public.verification_codes TO anon;
GRANT INSERT ON public.verification_codes TO anon;
