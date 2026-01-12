-- Corrige política RLS para slot_invites
-- Permite que admins criem convites para qualquer slot

-- Remove políticas existentes
drop policy if exists "slot_invites_manage_admin" on slot_invites;
drop policy if exists "slot_invites_select" on slot_invites;
drop policy if exists "slot_invites_insert" on slot_invites;
drop policy if exists "slot_invites_update" on slot_invites;
drop policy if exists "slot_invites_delete" on slot_invites;

-- Política de SELECT: todos autenticados podem ver convites
create policy "slot_invites_select" on slot_invites
  for select using (
    auth.uid() is not null
  );

-- Política de INSERT: admins podem criar convites
create policy "slot_invites_insert" on slot_invites
  for insert with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Política de UPDATE: admin ou o próprio convidado pode atualizar (aceitar/recusar)
create policy "slot_invites_update" on slot_invites
  for update using (
    -- Admin pode atualizar qualquer convite
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
    -- OU o próprio convidado pode aceitar/recusar
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.email = slot_invites.email
    )
  );

-- Política de DELETE: apenas admins podem deletar
create policy "slot_invites_delete" on slot_invites
  for delete using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
