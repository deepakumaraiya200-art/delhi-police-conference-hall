import type { User } from '@/types';

// ─── Dummy Login Credentials ─────────────────────────────────────────────────
// Admin:       admin@delhipolice.gov.in       / Admin@1234
// Caretaker 1: caretaker1@delhipolice.gov.in  / Care@1234
// Caretaker 2: caretaker2@delhipolice.gov.in  / Care@1234
// CP:          cp@delhipolice.gov.in          / CP@1234
// Special CP:  specialcp@delhipolice.gov.in   / SCP@1234
// Joint CP:    jointcp@delhipolice.gov.in     / JCP@1234
// Addl. CP:    addlcp@delhipolice.gov.in      / ADCP@1234
// DCP:         dcp@delhipolice.gov.in         / DCP@1234
// ACP:         acp@delhipolice.gov.in         / ACP@1234
// SI:          si@delhipolice.gov.in          / SI@1234
// User:        user@delhipolice.gov.in        / User@1234

export const users: User[] = [
  // ── Admin ────────────────────────────────────────────────────────────────
  {
    id: 'u-admin',
    name: 'Rajesh Kumar',
    email: 'admin@delhipolice.gov.in',
    password: 'Admin@1234',
    department: 'IT Center / PHQ Administration',
    role: 'admin',
    loginType: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=1A237E&color=fff&size=128',
  },

  // ── Caretakers ───────────────────────────────────────────────────────────
  {
    id: 'u-ct1',
    name: 'Sunita Verma',
    email: 'caretaker1@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-1', 'room-2', 'room-3', 'room-4', 'room-5', 'room-6', 'room-7'],
    avatar: 'https://ui-avatars.com/api/?name=Sunita+Verma&background=DB2777&color=fff&size=128',
  },
  {
    id: 'u-ct2',
    name: 'Mohan Lal',
    email: 'caretaker2@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-8', 'room-9', 'room-10', 'room-11', 'room-12', 'room-13', 'room-14'],
    avatar: 'https://ui-avatars.com/api/?name=Mohan+Lal&background=059669&color=fff&size=128',
  },

  // ── Officers (highest to lowest rank) ────────────────────────────────────
  {
    id: 'u-cp',
    name: 'Sanjay Arora',
    email: 'cp@delhipolice.gov.in',
    password: 'CP@1234',
    department: 'CP Secretariat',
    role: 'cp',
    loginType: 'officer',
    avatar: 'https://ui-avatars.com/api/?name=Sanjay+Arora&background=DC2626&color=fff&size=128',
  },
  {
    id: 'u-scp',
    name: 'Deepak Yadav',
    email: 'specialcp@delhipolice.gov.in',
    password: 'SCP@1234',
    department: 'Special Branch',
    role: 'special_cp',
    loginType: 'officer',
    avatar: 'https://ui-avatars.com/api/?name=Deepak+Yadav&background=EA580C&color=fff&size=128',
  },
  {
    id: 'u-jcp',
    name: 'Priya Sharma',
    email: 'jointcp@delhipolice.gov.in',
    password: 'JCP@1234',
    department: 'L&O / Administration',
    role: 'joint_cp',
    loginType: 'officer',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=D97706&color=fff&size=128',
  },
  {
    id: 'u-adcp',
    name: 'Vikram Malhotra',
    email: 'addlcp@delhipolice.gov.in',
    password: 'ADCP@1234',
    department: 'Crime Branch',
    role: 'additional_cp',
    loginType: 'officer',
    avatar: 'https://ui-avatars.com/api/?name=Vikram+Malhotra&background=CA8A04&color=fff&size=128',
  },
  {
    id: 'u-dcp',
    name: 'Amit Singh',
    email: 'dcp@delhipolice.gov.in',
    password: 'DCP@1234',
    department: 'DCP/GA',
    role: 'dcp',
    loginType: 'officer',
    avatar: 'https://ui-avatars.com/api/?name=Amit+Singh&background=2563EB&color=fff&size=128',
  },
  {
    id: 'u-acp',
    name: 'Neha Patel',
    email: 'acp@delhipolice.gov.in',
    password: 'ACP@1234',
    department: 'Special Cell',
    role: 'acp',
    loginType: 'officer',
    avatar: 'https://ui-avatars.com/api/?name=Neha+Patel&background=4F46E5&color=fff&size=128',
  },
  {
    id: 'u-si',
    name: 'Rohit Mehta',
    email: 'si@delhipolice.gov.in',
    password: 'SI@1234',
    department: 'Traffic',
    role: 'si',
    loginType: 'officer',
    avatar: 'https://ui-avatars.com/api/?name=Rohit+Mehta&background=7C3AED&color=fff&size=128',
  },
  {
    id: 'u-user',
    name: 'Kavita Joshi',
    email: 'user@delhipolice.gov.in',
    password: 'User@1234',
    department: 'PRO',
    role: 'user',
    loginType: 'officer',
    avatar: 'https://ui-avatars.com/api/?name=Kavita+Joshi&background=0891B2&color=fff&size=128',
  },
];
