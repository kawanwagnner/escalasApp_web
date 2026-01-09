-- Server-side scheduling for assignments: when an assignment is created, insert scheduled_notifications rows so a worker can deliver them.

create table if not exists scheduled_notifications (
  id bigint primary key generated always as identity,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text,
  body text,
  send_at timestamptz not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table scheduled_notifications enable row level security;

-- allow service role to insert
-- allow service role to insert
drop policy if exists "insert_by_service" on scheduled_notifications;
create policy "insert_by_service" on scheduled_notifications
  for insert with check ( auth.role() = 'service_role' );

-- allow service role to select (worker reads due notifications)
drop policy if exists "select_by_service" on scheduled_notifications;
create policy "select_by_service" on scheduled_notifications
  for select using ( auth.role() = 'service_role' );

-- allow service role to delete (worker removes processed notifications)
drop policy if exists "delete_by_service" on scheduled_notifications;
create policy "delete_by_service" on scheduled_notifications
  for delete using ( auth.role() = 'service_role' );

create index if not exists scheduled_notifications_user_idx on scheduled_notifications(user_id);
create index if not exists scheduled_notifications_send_at_idx on scheduled_notifications(send_at);

-- Function to create scheduled notifications for an assignment
create or replace function public.enqueue_assignment_notifications()
returns trigger as $$
declare
  v_slot record;
  v_user_id uuid;
  v_title text;
  v_body text;
  v_send timestamptz;
begin
  if TG_OP = 'INSERT' then
    v_user_id := NEW.user_id;
    select * into v_slot from slots where id = NEW.slot_id;
    if v_slot is null then
      return NEW;
    end if;

    v_title := 'Lembrete de Escala';
    v_body := format('Você tem "%s" em 24 horas', v_slot.title);

    -- 24h
    v_send := v_slot.start_time - interval '24 hours';
    if v_send > now() then
      insert into scheduled_notifications (user_id, type, title, body, send_at, payload)
      values (v_user_id, 'assignment_24h', v_title, v_body, v_send, jsonb_build_object('assignment_id', NEW.id));
    end if;

    -- 48h (for teacher) - check profile
    if (select is_teacher from profiles where id = v_user_id) then
      v_send := v_slot.start_time - interval '48 hours';
      if v_send > now() then
        insert into scheduled_notifications (user_id, type, title, body, send_at, payload)
        values (v_user_id, 'assignment_48h', 'Lembrete de Escala (Professor)', format('Você tem "%s" em 48 horas - Prepare o material', v_slot.title), v_send, jsonb_build_object('assignment_id', NEW.id));
      end if;

      v_send := v_slot.start_time - interval '6 hours';
      if v_send > now() then
        insert into scheduled_notifications (user_id, type, title, body, send_at, payload)
        values (v_user_id, 'assignment_6h', 'Lembrete de Escala (Professor)', format('Você tem "%s" em 6 horas - Últimos preparativos!', v_slot.title), v_send, jsonb_build_object('assignment_id', NEW.id));
      end if;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger trg_enqueue_assignment_notifications
after insert on assignments
for each row execute function public.enqueue_assignment_notifications();
