// Types para toda aplicação
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'member';
  phone?: string;
  is_teacher?: boolean;
  is_musician?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: User;
}

export interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'member';
  email: string;
  phone?: string;
  is_teacher?: boolean;
  is_musician?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  date: string;
  notify_24h: boolean;
  notify_48h: boolean;
  notify_48h_musician: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Slot {
  id: string;
  schedule_id: string;
  theme_id: string;
  date: string;
  start_time: string;
  end_time: string;
  mode: 'manual' | 'automatic';
  capacity: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  slot_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  slot?: Slot;
  user?: Profile;
}

export interface SlotInvite {
  id: string;
  slot_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  accepted_by?: string;
  accepted_at?: string;
  created_at: string;
  slot?: Slot;
}

export interface ApiError {
  message: string;
  status?: number;
}

// ========== NOVOS TIPOS (25 endpoints restantes) ==========

export interface Announcement {
  id: string;
  title: string;
  message: string;
  created_by?: string;
  created_at: string;
}

export interface PublicEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  scheduled_for: string;
  sent: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}
