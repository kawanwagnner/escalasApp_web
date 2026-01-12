-- =====================================================
-- Criação da Tabela Students
-- =====================================================
-- Tabela para gerenciar dados de estudantes/alunos

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  birth_date DATE,
  sex TEXT CHECK (sex IN ('Masculino', 'Feminino', 'Outro')),
  group_id UUID, -- Referência a um grupo (pode ser NULL se não houver tabela de grupos)
  guardian_name TEXT,
  guardian_contact TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_students_group_id ON public.students(group_id);
CREATE INDEX IF NOT EXISTS idx_students_full_name ON public.students(full_name);
CREATE INDEX IF NOT EXISTS idx_students_birth_date ON public.students(birth_date);

-- Habilita RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Admins podem fazer tudo
DROP POLICY IF EXISTS "students_admin_all" ON public.students;
CREATE POLICY "students_admin_all" ON public.students
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
DROP POLICY IF EXISTS "students_member_select" ON public.students;
CREATE POLICY "students_member_select" ON public.students
  FOR SELECT
  TO authenticated
  USING (true); -- Todos autenticados podem ver

-- Comentários
COMMENT ON TABLE public.students IS 'Tabela de estudantes/alunos';
COMMENT ON COLUMN public.students.group_id IS 'ID do grupo ao qual o estudante pertence';
COMMENT ON COLUMN public.students.guardian_name IS 'Nome do responsável/guardião';
COMMENT ON COLUMN public.students.guardian_contact IS 'Contato do responsável';

-- =====================================================
-- Inserção dos Dados dos Estudantes
-- =====================================================

-- NOTA: Substitua {{group}} pelo UUID real do grupo desejado
-- Exemplo: '123e4567-e89b-12d3-a456-426614174000'

INSERT INTO public.students (
  full_name,
  birth_date,
  sex,
  group_id,
  guardian_name,
  guardian_contact,
  notes,
  photo_url
) VALUES
  ('ALANA VITORIA LYRA DE SOUZA', '2018-05-10', 'Feminino', NULL, NULL, NULL, '', NULL),
  ('ANNA LUIZA NASCIMENTO DOS SANTOS ANNA', '2015-03-16', 'Feminino', NULL, NULL, NULL, '', NULL),
  ('ANNE MANZONI LEAL', '2020-05-27', 'Feminino', NULL, NULL, NULL, '', NULL),
  ('BRENDA MARIANA DA SILVA MARTINS', '2014-07-26', 'Feminino', NULL, NULL, NULL, '', NULL),
  ('BRENO DE SA SOARES', '2018-03-30', 'Masculino', NULL, NULL, NULL, '', NULL),
  ('CALEBE SILVA PIRES DE CAMARGO', '2016-06-10', 'Masculino', NULL, NULL, NULL, '', NULL),
  ('CECILIA ROCHA MORALES', '2017-05-25', 'Feminino', NULL, NULL, NULL, '', NULL),
  ('DAVI LUIZ ROCHA MORALES', '2013-08-02', 'Masculino', NULL, NULL, NULL, '', NULL),
  ('EMILLY DA SILVA BARROS', '2017-01-12', 'Feminino', NULL, NULL, NULL, '', NULL),
  ('ERICK DAVI DA SILVA MARTINS', '2014-10-15', 'Masculino', NULL, NULL, NULL, '', NULL),
  ('FELIPE GABRIEL DE SOUZA PEREIRA', '2014-05-25', 'Masculino', NULL, NULL, NULL, '', NULL),
  ('LUAN SILVA ROCHA DOS SANTOS', '2017-05-19', 'Masculino', NULL, NULL, NULL, '', NULL),
  ('PEDRO BATISTA ZEGA', '2021-10-13', 'Masculino', NULL, NULL, NULL, '', NULL),
  ('PEDRO GABRIEL ALMEIDA REZENDE', '2021-08-27', 'Masculino', NULL, NULL, NULL, '', NULL),
  ('PETER DE MARCHI LEAL', '2018-02-21', 'Masculino', NULL, NULL, NULL, '', NULL),
  ('YSRAEL MARTINS DE CALDAS', '2019-09-16', 'Masculino', NULL, NULL, NULL, '', NULL);

-- =====================================================
-- Verificação
-- =====================================================
-- Para verificar os dados inseridos, execute:
-- SELECT * FROM public.students ORDER BY full_name;
