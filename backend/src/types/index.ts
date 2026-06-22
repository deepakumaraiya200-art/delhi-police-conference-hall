export type BookingStatus = 'confirmed' | 'ongoing' | 'reserved' | 'cancelled' | 'completed';
export type RoomStatus    = 'available' | 'occupied' | 'reserved' | 'under_maintenance';
export type LoginType     = 'admin' | 'caretaker' | 'officer';
export type OfficerRank   = 'cp' | 'special_cp' | 'joint_cp' | 'additional_cp' | 'dcp' | 'acp' | 'si' | 'user';
export type UserRole      = 'admin' | 'caretaker' | OfficerRank;

export const RANK_HIERARCHY: Record<string, number> = {
  admin:        0,
  cp:           1,
  special_cp:   2,
  joint_cp:     3,
  additional_cp: 4,
  dcp:          5,
  acp:          6,
  si:           7,
  user:         8,
  caretaker:    9,
};

export const RANK_LABELS: Record<string, string> = {
  admin:        'Administrator',
  cp:           'Commissioner of Police',
  special_cp:   'Special Commissioner of Police',
  joint_cp:     'Joint Commissioner of Police',
  additional_cp: 'Addl. Commissioner of Police',
  dcp:          'Deputy Commissioner of Police',
  acp:          'Assistant Commissioner of Police',
  si:           'Sub-Inspector',
  user:         'Officer',
  caretaker:    'Caretaker',
};

export function isSeniorTo(roleA: string, roleB: string): boolean {
  return (RANK_HIERARCHY[roleA] ?? 99) < (RANK_HIERARCHY[roleB] ?? 99);
}

export function getRankLabel(role: string): string {
  return RANK_LABELS[role] ?? role;
}

// ── Row shapes returned from pg ──────────────────────────────────────────────

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  department: string;
  role: string;
  login_type: string;
  demo_email: string | null;
  assigned_rooms: string[] | null;
  avatar: string | null;
  created_at: string;
}

export interface RoomRow {
  id: string;
  name: string;
  room_number: string;
  tower: string;
  floor: string;
  capacity_min: number;
  capacity_max: number;
  status: RoomStatus;
  managed_by: string;
  caretaker_id: string;
  type: string;
  amenities: string[];
  img_src: string;
  image: string;
  description: string;
  created_at: string;
}

export interface BookingRow {
  id: string;
  room_id: string;
  user_id: string;
  title: string;
  description: string;
  organizer: string;
  participants_count: number;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  cancel_reason: string | null;
  overridden_by: string | null;
  mom: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  timestamp: string;
}

// ── API response helpers ─────────────────────────────────────────────────────

export function toUser(r: UserRow) {
  return {
    id:            r.id,
    name:          r.name,
    email:         r.email,
    department:    r.department,
    role:          r.role,
    loginType:     r.login_type,
    demoEmail:     r.demo_email ?? undefined,
    assignedRooms: r.assigned_rooms ?? [],
    avatar:        r.avatar ?? '',
  };
}

export function toRoom(r: RoomRow) {
  return {
    id:          r.id,
    name:        r.name,
    roomNumber:  r.room_number,
    tower:       r.tower,
    floor:       r.floor,
    capacity:    { min: r.capacity_min, max: r.capacity_max },
    status:      r.status,
    managedBy:   r.managed_by,
    caretakerId: r.caretaker_id,
    type:        r.type,
    amenities:   r.amenities ?? [],
    imgsrc:      r.img_src,
    image:       r.image,
    description: r.description,
  };
}

export function toBooking(r: BookingRow) {
  return {
    id:                r.id,
    roomId:            r.room_id,
    userId:            r.user_id,
    title:             r.title,
    description:       r.description,
    organizer:         r.organizer,
    participantsCount: r.participants_count,
    date:              typeof r.date === 'string' ? r.date.slice(0, 10) : (r.date as unknown as Date).toISOString().slice(0, 10),
    startTime:         r.start_time,
    endTime:           r.end_time,
    status:            r.status,
    cancelReason:      r.cancel_reason ?? undefined,
    overriddenBy:      r.overridden_by ?? undefined,
    mom:               r.mom ?? undefined,
    createdAt:         r.created_at,
  };
}

export function toNotification(r: NotificationRow) {
  return {
    id:        r.id,
    userId:    r.user_id,
    type:      r.type,
    message:   r.message,
    read:      r.read,
    timestamp: r.timestamp,
  };
}

// ── JWT payload ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId:    string;
  email:     string;
  role:      string;
  loginType: string;
  name:      string;
}
