-- =====================================================
-- SISTEMA DE VERIFICAÇÃO POR CÓDIGO CUSTOMIZADO
-- =====================================================
-- Este script cria a tabela e funções necessárias para
-- o sistema próprio de recuperação de senha.
-- =====================================================

-- 1. Criar a tabela verification_codes
CREATE TABLE IF NOT EXISTS public.verification_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes')
);

-- 2. Criar índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON public.verification_codes(email);

-- 3. Criar índice para limpeza de códigos expirados
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON public.verification_codes(expires_at);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- 5. Política para permitir inserção via service role (Edge Functions)
CREATE POLICY "Allow service role full access" ON public.verification_codes
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 6. Política para permitir leitura anônima para validação
CREATE POLICY "Allow anonymous read for validation" ON public.verification_codes
    FOR SELECT
    USING (true);

-- 7. Política para permitir deleção anônima (após validação)
CREATE POLICY "Allow anonymous delete" ON public.verification_codes
    FOR DELETE
    USING (true);

-- 8. Função para gerar código de verificação de 6 dígitos
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 9. Função para criar/atualizar código de verificação (upsert)
CREATE OR REPLACE FUNCTION create_or_update_verification_code(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
BEGIN
    -- Gera novo código
    v_code := generate_verification_code();
    
    -- Insere ou atualiza (substitui código anterior do mesmo email)
    INSERT INTO public.verification_codes (email, code, created_at, expires_at)
    VALUES (
        LOWER(TRIM(p_email)), 
        v_code, 
        NOW(), 
        NOW() + INTERVAL '30 minutes'
    )
    ON CONFLICT (email) 
    DO UPDATE SET 
        code = v_code,
        created_at = NOW(),
        expires_at = NOW() + INTERVAL '30 minutes';
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Função para validar código
CREATE OR REPLACE FUNCTION validate_verification_code(p_email TEXT, p_code TEXT)
RETURNS TABLE(is_valid BOOLEAN, message TEXT) AS $$
DECLARE
    v_record RECORD;
BEGIN
    -- Busca o registro do código
    SELECT * INTO v_record 
    FROM public.verification_codes 
    WHERE email = LOWER(TRIM(p_email)) AND code = p_code;
    
    -- Verifica se o código existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Código inválido ou não encontrado';
        RETURN;
    END IF;
    
    -- Verifica se expirou
    IF v_record.expires_at < NOW() THEN
        -- Remove código expirado
        DELETE FROM public.verification_codes WHERE id = v_record.id;
        RETURN QUERY SELECT FALSE, 'Código expirado. Solicite um novo código.';
        RETURN;
    END IF;
    
    -- Código válido - remove da tabela
    DELETE FROM public.verification_codes WHERE id = v_record.id;
    
    RETURN QUERY SELECT TRUE, 'Código validado com sucesso';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Função para limpar códigos expirados (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.verification_codes 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Criar extensão pg_cron se não existir (para limpeza automática)
-- NOTA: Esta extensão precisa ser habilitada no painel do Supabase
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 13. Agendar limpeza automática a cada 15 minutos (descomentar após habilitar pg_cron)
-- SELECT cron.schedule(
--     'cleanup-expired-verification-codes',
--     '*/15 * * * *',
--     'SELECT cleanup_expired_verification_codes()'
-- );

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE public.verification_codes IS 'Armazena códigos de verificação temporários para recuperação de senha';
COMMENT ON COLUMN public.verification_codes.email IS 'Email do usuário (único - apenas um código ativo por email)';
COMMENT ON COLUMN public.verification_codes.code IS 'Código de verificação de 6 dígitos';
COMMENT ON COLUMN public.verification_codes.created_at IS 'Data/hora de criação do código';
COMMENT ON COLUMN public.verification_codes.expires_at IS 'Data/hora de expiração (30 minutos após criação)';

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR SENHA DO USUÁRIO
-- =====================================================
-- IMPORTANTE: Esta função requer privilégios elevados.
-- É recomendado usar uma Edge Function para maior segurança.
-- A função abaixo é um exemplo e deve ser adaptada conforme necessário.

-- Função para atualizar senha do usuário (chamada após verificação do código)
-- NOTA: Esta função precisa de SECURITY DEFINER e acesso ao schema auth
CREATE OR REPLACE FUNCTION admin_update_user_password(p_email TEXT, p_new_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Busca o ID do usuário pelo email
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = LOWER(TRIM(p_email));
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado';
    END IF;
    
    -- Atualiza a senha do usuário
    -- NOTA: Esta operação requer que a função tenha permissões adequadas
    UPDATE auth.users 
    SET 
        encrypted_password = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = v_user_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao atualizar senha: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PERMISSÕES PARA USUÁRIOS ANÔNIMOS => parei aqui
-- =====================================================
-- Permite que usuários não autenticados (anon) chamem as funções RPC
-- Isso é necessário para o fluxo de recuperação de senha funcionar

-- Permite chamada da função de criar código
GRANT EXECUTE ON FUNCTION create_or_update_verification_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_or_update_verification_code(TEXT) TO authenticated;

-- Permite chamada da função de validar código
GRANT EXECUTE ON FUNCTION validate_verification_code(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION validate_verification_code(TEXT, TEXT) TO authenticated;

-- Permite chamada da função de limpar códigos expirados
GRANT EXECUTE ON FUNCTION cleanup_expired_verification_codes() TO anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_verification_codes() TO authenticated;

-- Permite chamada da função de atualizar senha (via código verificado)
GRANT EXECUTE ON FUNCTION admin_update_user_password(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION admin_update_user_password(TEXT, TEXT) TO authenticated;

-- Permite acesso à tabela para leitura (necessário para as policies funcionarem)
GRANT SELECT ON public.verification_codes TO anon;
GRANT DELETE ON public.verification_codes TO anon;
