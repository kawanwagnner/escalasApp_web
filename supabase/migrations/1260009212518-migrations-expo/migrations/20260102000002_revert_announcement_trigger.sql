-- Revert announcement email trigger (não é mais necessário, emails são enviados pelo app)

-- Remove the trigger
drop trigger if exists on_announcement_created on announcements;

-- Remove the function
drop function if exists trigger_announcement_email();

-- Add comment explaining the change
comment on table announcements is 'Announcements table - emails are now sent directly from the app when a new announcement is created';
