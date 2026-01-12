-- Corrige políticas RLS para assignments e slot_invites
-- Permite que usuários autenticados criem assignments quando aceitam convites

-- ================== ASSIGNMENTS ==================

-- Remove políticas existentes
drop policy if exists "assignments_select" on assignments;
drop policy if exists "assignments_insert" on assignments;
drop policy if exists "assignments_delete" on assignments;
drop policy if exists "Usuários podem ver seus próprios assignments" on assignments;
drop policy if exists "Admins podem gerenciar assignments" on assignments;

-- Habilita RLS
alter table assignments enable row level security;

-- Política de SELECT: todos autenticados podem ver assignments
create policy "assignments_select" on assignments
  for select using (
    auth.uid() is not null
  );

-- Política de INSERT: admins podem criar OU o próprio usuário pode se atribuir
create policy "assignments_insert" on assignments
  for insert with check (
    -- Admin pode criar qualquer assignment
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
    -- OU usuário pode se auto-atribuir (quando aceita convite)
    or user_id = auth.uid()
  );

-- Política de DELETE: admins podem deletar OU o próprio usuário pode remover
create policy "assignments_delete" on assignments
  for delete using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
    or user_id = auth.uid()
  );

-- ================== SLOT_INVITES UPDATE ==================

-- Garante que a política de UPDATE permite o convidado aceitar/recusar
drop policy if exists "slot_invites_update" on slot_invites;

create policy "slot_invites_update" on slot_invites
  for update using (
    -- Admin pode atualizar qualquer convite
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
    -- OU o próprio convidado pode aceitar/recusar (comparando email)
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and lower(profiles.email) = lower(slot_invites.email)
    )
  );
