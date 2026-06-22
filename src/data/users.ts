import type { User } from '@/types';

// ─── Login Credentials Master List ───────────────────────────────────────────
//
// ADMIN
//   admin@delhipolice.gov.in          / Admin@1234   (OTP → dp.admin@yopmail.com)
//
// CARETAKERS  (one per room, format: caretaker.{roomNo}@delhipolice.gov.in / Care@1234)
//   caretaker.aud@delhipolice.gov.in  → Adarsh Auditorium (GF-AUD)   → dp.ct.aud@yopmail.com
//   caretaker.13@delhipolice.gov.in   → Media Conf Hall (Rm 13)       → dp.ct.13@yopmail.com
//   caretaker.107@delhipolice.gov.in  → Room 107                      → dp.ct.107@yopmail.com
//   caretaker.203@delhipolice.gov.in  → Room 203                      → dp.ct.203@yopmail.com
//   caretaker.307@delhipolice.gov.in  → Room 307                      → dp.ct.307@yopmail.com
//   caretaker.420@delhipolice.gov.in  → Room 420                      → dp.ct.420@yopmail.com
//   caretaker.1305@delhipolice.gov.in → Room 1305                     → dp.ct.1305@yopmail.com
//   caretaker.1400@delhipolice.gov.in → Room 1400                     → dp.ct.1400@yopmail.com
//   caretaker.1700@delhipolice.gov.in → 17th Floor Conf Hall          → dp.ct.1700@yopmail.com
//   caretaker.1429@delhipolice.gov.in → Room 1429 (Bridge Tower)      → dp.ct.1429@yopmail.com
//   caretaker.124@delhipolice.gov.in  → Room 124 (Tower II)           → dp.ct.124@yopmail.com
//   caretaker.216@delhipolice.gov.in  → Room 216 (Tower II)           → dp.ct.216@yopmail.com
//   caretaker.326@delhipolice.gov.in  → Room 326 (Tower II)           → dp.ct.326@yopmail.com
//   caretaker.727@delhipolice.gov.in  → Room 727 (Tower II)           → dp.ct.727@yopmail.com
//
// OFFICERS
//   cp@delhipolice.gov.in             / CP@1234     (OTP → dp.cp.arora@yopmail.com)
//   specialcp@delhipolice.gov.in      / SCP@1234    (OTP → dp.scp.deepak@yopmail.com)
//   jointcp@delhipolice.gov.in        / JCP@1234    (OTP → dp.jcp.priya@yopmail.com)
//   addlcp@delhipolice.gov.in         / ADCP@1234   (OTP → dp.adcp.vikram@yopmail.com)
//   dcp@delhipolice.gov.in            / DCP@1234    (OTP → dp.dcp.amit@yopmail.com)
//   acp@delhipolice.gov.in            / ACP@1234    (OTP → dp.acp.neha@yopmail.com)
//   si@delhipolice.gov.in             / SI@1234     (OTP → dp.si.rohit@yopmail.com)
//   user@delhipolice.gov.in           / User@1234   (OTP → dp.user.kavita@yopmail.com)
//
// To check OTP during demo: visit yopmail.com and enter the address above
// ─────────────────────────────────────────────────────────────────────────────

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
    demoEmail: 'dp.admin@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=1A237E&color=fff&size=128',
  },

  // ── Caretakers (one per room) ─────────────────────────────────────────────
  {
    id: 'u-ct-aud',
    name: 'Ramesh Gupta',
    email: 'caretaker.aud@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-1'],
    demoEmail: 'dp.ct.aud@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Ramesh+Gupta&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-13',
    name: 'Meena Sharma',
    email: 'caretaker.13@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-2'],
    demoEmail: 'dp.ct.13@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Meena+Sharma&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-107',
    name: 'Suresh Pal',
    email: 'caretaker.107@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-3'],
    demoEmail: 'dp.ct.107@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Suresh+Pal&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-203',
    name: 'Geeta Devi',
    email: 'caretaker.203@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-4'],
    demoEmail: 'dp.ct.203@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Geeta+Devi&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-307',
    name: 'Dinesh Kumar',
    email: 'caretaker.307@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-5'],
    demoEmail: 'dp.ct.307@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Dinesh+Kumar&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-420',
    name: 'Pooja Singh',
    email: 'caretaker.420@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-6'],
    demoEmail: 'dp.ct.420@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Pooja+Singh&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-1305',
    name: 'Ashok Jain',
    email: 'caretaker.1305@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-7'],
    demoEmail: 'dp.ct.1305@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Ashok+Jain&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-1400',
    name: 'Savita Rani',
    email: 'caretaker.1400@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-8'],
    demoEmail: 'dp.ct.1400@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Savita+Rani&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-1700',
    name: 'Vinod Sharma',
    email: 'caretaker.1700@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-9'],
    demoEmail: 'dp.ct.1700@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Vinod+Sharma&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-1429',
    name: 'Kamla Devi',
    email: 'caretaker.1429@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-10'],
    demoEmail: 'dp.ct.1429@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Kamla+Devi&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-124',
    name: 'Manoj Yadav',
    email: 'caretaker.124@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-11'],
    demoEmail: 'dp.ct.124@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Manoj+Yadav&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-216',
    name: 'Anita Kumari',
    email: 'caretaker.216@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-12'],
    demoEmail: 'dp.ct.216@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Anita+Kumari&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-326',
    name: 'Hemant Pandey',
    email: 'caretaker.326@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-13'],
    demoEmail: 'dp.ct.326@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Hemant+Pandey&background=065f46&color=fff&size=128',
  },
  {
    id: 'u-ct-727',
    name: 'Ritu Verma',
    email: 'caretaker.727@delhipolice.gov.in',
    password: 'Care@1234',
    department: 'PHQ Administration',
    role: 'caretaker',
    loginType: 'caretaker',
    assignedRooms: ['room-14'],
    demoEmail: 'dp.ct.727@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Ritu+Verma&background=065f46&color=fff&size=128',
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
    demoEmail: 'dp.cp.arora@yopmail.com',
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
    demoEmail: 'dp.scp.deepak@yopmail.com',
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
    demoEmail: 'dp.jcp.priya@yopmail.com',
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
    demoEmail: 'dp.adcp.vikram@yopmail.com',
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
    demoEmail: 'dp.dcp.amit@yopmail.com',
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
    demoEmail: 'dp.acp.neha@yopmail.com',
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
    demoEmail: 'dp.si.rohit@yopmail.com',
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
    demoEmail: 'dp.user.kavita@yopmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Kavita+Joshi&background=0891B2&color=fff&size=128',
  },
];
