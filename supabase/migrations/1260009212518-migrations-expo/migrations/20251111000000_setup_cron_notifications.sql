-- =====================================================
-- Configuração de Cron Job para Notificações Automáticas
-- =====================================================
-- Este script configura um cron job que executa a cada minuto
-- verificando e enviando notificações agendadas nos horários corretos
-- Fuso horário: America/Sao_Paulo (Brasília/Brasil)

-- Habilita as extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove job anterior se existir (para evitar duplicatas)
DO $$
BEGIN
  -- Verifica se o job existe antes de tentar remover
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-scheduled-notifications') THEN
    PERFORM cron.unschedule('send-scheduled-notifications');
  END IF;
END $$;

-- Cria o cron job que executa a cada minuto
-- Chama a Edge Function send-scheduled-notifications
SELECT cron.schedule(
  'send-scheduled-notifications',           -- nome do job
  '* * * * *',                              -- executa todo minuto
  $$
  SELECT
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-scheduled-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object(
        'timestamp', NOW()
      )
    ) AS request_id;
  $$
);

-- =====================================================
-- Índices para Performance
-- =====================================================
-- Cria índice para buscar notificações agendadas eficientemente
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_send_at 
ON scheduled_notifications(send_at);

-- Cria índice composto para queries de notificações por usuário e horário
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user_send_at 
ON scheduled_notifications(user_id, send_at);

-- =====================================================
-- Configurações de Timezone
-- =====================================================
-- Define o timezone padrão como São Paulo
ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';

-- Função helper para converter horários para o fuso de Brasília
CREATE OR REPLACE FUNCTION get_brazil_time()
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN NOW() AT TIME ZONE 'America/Sao_Paulo';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- Monitoramento e Logs
-- =====================================================
-- Tabela para logs de execução do cron (opcional, para debug)
CREATE TABLE IF NOT EXISTS cron_execution_logs (
  id BIGSERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT,
  notifications_sent INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  details JSONB
);

-- Política RLS para admin visualizar logs
ALTER TABLE cron_execution_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view cron logs" ON cron_execution_logs;
CREATE POLICY "Admins can view cron logs"
ON cron_execution_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- Comentários e Documentação
-- =====================================================
COMMENT ON EXTENSION pg_cron IS 'Extensão para agendamento de jobs cron no PostgreSQL';
COMMENT ON TABLE cron_execution_logs IS 'Logs de execução dos cron jobs de notificações';
COMMENT ON FUNCTION get_brazil_time() IS 'Retorna o horário atual no fuso de Brasília (America/Sao_Paulo)';

-- =====================================================
-- Verificação
-- =====================================================
-- Para verificar se o cron está ativo, execute:
-- SELECT * FROM cron.job;
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
