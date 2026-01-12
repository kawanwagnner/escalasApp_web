-- =====================================================
-- Criação da Tabela Groups
-- =====================================================
-- Tabela para gerenciar grupos de estudantes (Betel e Peniel)

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  min_age INTEGER,
  max_age INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_groups_name ON public.groups(name);

-- Habilita RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Admins podem fazer tudo
DROP POLICY IF EXISTS "groups_admin_all" ON public.groups;
CREATE POLICY "groups_admin_all" ON public.groups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Membros podem apenas visualizar
DROP POLICY IF EXISTS "groups_member_select" ON public.groups;
CREATE POLICY "groups_member_select" ON public.groups
  FOR SELECT
  TO authenticated
  USING (true); -- Todos autenticados podem ver

-- Comentários
COMMENT ON TABLE public.groups IS 'Tabela de grupos de estudantes';
COMMENT ON COLUMN public.groups.min_age IS 'Idade mínima para o grupo';
COMMENT ON COLUMN public.groups.max_age IS 'Idade máxima para o grupo';

-- =====================================================
-- Inserção dos Grupos
-- =====================================================

INSERT INTO public.groups (name, description, min_age, max_age) VALUES
  ('Betel', 'Grupo para crianças menores (até 8 anos)', 0, 8),
  ('Peniel', 'Grupo para crianças maiores (9 anos ou mais)', 9, 18)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- Atualizar Foreign Key na tabela students
-- =====================================================

-- Adiciona constraint de foreign key se ainda não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'students_group_id_fkey'
  ) THEN
    ALTER TABLE public.students 
    ADD CONSTRAINT students_group_id_fkey 
    FOREIGN KEY (group_id) 
    REFERENCES public.groups(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================
-- Verificação
-- =====================================================
-- Para ver os grupos criados:
-- SELECT * FROM public.groups ORDER BY name;
