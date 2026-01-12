-- Fix assignments insert policy to handle free slots correctly
drop policy if exists "assignments_insert_free_or_admin" on assignments;

create policy "assignments_insert_free_or_admin" on assignments
  for insert with check (
    -- Admin pode inserir qualquer assignment
    exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    or
    -- Usuário pode se inscrever em slot livre se:
    -- 1. É o próprio user_id do assignment
    -- 2. O slot existe e é do tipo 'livre'
    -- 3. Ainda há vagas disponíveis
    (
      auth.uid() = user_id
      and exists(
        select 1 
        from slots s 
        where s.id = slot_id 
        and s.mode = 'livre'
        and (
          select count(*) 
          from assignments a 
          where a.slot_id = s.id
        ) < s.capacity
      )
    )
  );
