import bcrypt from 'bcryptjs';
import { db } from './client.js';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('[Seed] Running schema…');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await db.query(schema);

  // ── Users ──────────────────────────────────────────────────────────────────
  const SALT = 12;

  interface UserSeed {
    id: string; name: string; email: string; password: string;
    department: string; role: string; loginType: string;
    demoEmail: string | null; assignedRooms: string[] | null; avatar: string;
  }

  const users: UserSeed[] = [
    // Admin
    { id: 'u-admin', name: 'Rajesh Kumar', email: 'admin@delhipolice.gov.in', password: 'Admin@1234',
      department: 'IT Center / PHQ Administration', role: 'admin', loginType: 'admin',
      demoEmail: 'admin@sharklasers.com', assignedRooms: null,
      avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=1A237E&color=fff&size=128' },

    // Caretakers
    { id: 'u-ct-aud', name: 'Ramesh Gupta', email: 'caretaker.aud@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.aud@sharklasers.com', assignedRooms: ['room-1'],
      avatar: 'https://ui-avatars.com/api/?name=Ramesh+Gupta&background=065f46&color=fff&size=128' },
    { id: 'u-ct-13', name: 'Meena Sharma', email: 'caretaker.13@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.13@sharklasers.com', assignedRooms: ['room-2'],
      avatar: 'https://ui-avatars.com/api/?name=Meena+Sharma&background=065f46&color=fff&size=128' },
    { id: 'u-ct-107', name: 'Suresh Pal', email: 'caretaker.107@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.107@sharklasers.com', assignedRooms: ['room-3'],
      avatar: 'https://ui-avatars.com/api/?name=Suresh+Pal&background=065f46&color=fff&size=128' },
    { id: 'u-ct-203', name: 'Geeta Devi', email: 'caretaker.203@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.203@sharklasers.com', assignedRooms: ['room-4'],
      avatar: 'https://ui-avatars.com/api/?name=Geeta+Devi&background=065f46&color=fff&size=128' },
    { id: 'u-ct-307', name: 'Dinesh Kumar', email: 'caretaker.307@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.307@sharklasers.com', assignedRooms: ['room-5'],
      avatar: 'https://ui-avatars.com/api/?name=Dinesh+Kumar&background=065f46&color=fff&size=128' },
    { id: 'u-ct-420', name: 'Pooja Singh', email: 'caretaker.420@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.420@sharklasers.com', assignedRooms: ['room-6'],
      avatar: 'https://ui-avatars.com/api/?name=Pooja+Singh&background=065f46&color=fff&size=128' },
    { id: 'u-ct-1305', name: 'Ashok Jain', email: 'caretaker.1305@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.1305@sharklasers.com', assignedRooms: ['room-7'],
      avatar: 'https://ui-avatars.com/api/?name=Ashok+Jain&background=065f46&color=fff&size=128' },
    { id: 'u-ct-1400', name: 'Savita Rani', email: 'caretaker.1400@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.1400@sharklasers.com', assignedRooms: ['room-8'],
      avatar: 'https://ui-avatars.com/api/?name=Savita+Rani&background=065f46&color=fff&size=128' },
    { id: 'u-ct-1700', name: 'Vinod Sharma', email: 'caretaker.1700@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.1700@sharklasers.com', assignedRooms: ['room-9'],
      avatar: 'https://ui-avatars.com/api/?name=Vinod+Sharma&background=065f46&color=fff&size=128' },
    { id: 'u-ct-1429', name: 'Kamla Devi', email: 'caretaker.1429@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.1429@sharklasers.com', assignedRooms: ['room-10'],
      avatar: 'https://ui-avatars.com/api/?name=Kamla+Devi&background=065f46&color=fff&size=128' },
    { id: 'u-ct-124', name: 'Manoj Yadav', email: 'caretaker.124@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.124@sharklasers.com', assignedRooms: ['room-11'],
      avatar: 'https://ui-avatars.com/api/?name=Manoj+Yadav&background=065f46&color=fff&size=128' },
    { id: 'u-ct-216', name: 'Anita Kumari', email: 'caretaker.216@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.216@sharklasers.com', assignedRooms: ['room-12'],
      avatar: 'https://ui-avatars.com/api/?name=Anita+Kumari&background=065f46&color=fff&size=128' },
    { id: 'u-ct-326', name: 'Hemant Pandey', email: 'caretaker.326@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.326@sharklasers.com', assignedRooms: ['room-13'],
      avatar: 'https://ui-avatars.com/api/?name=Hemant+Pandey&background=065f46&color=fff&size=128' },
    { id: 'u-ct-727', name: 'Ritu Verma', email: 'caretaker.727@delhipolice.gov.in', password: 'Care@1234',
      department: 'PHQ Administration', role: 'caretaker', loginType: 'caretaker',
      demoEmail: 'caretaker.727@sharklasers.com', assignedRooms: ['room-14'],
      avatar: 'https://ui-avatars.com/api/?name=Ritu+Verma&background=065f46&color=fff&size=128' },

    // Officers
    { id: 'u-cp', name: 'Sanjay Arora', email: 'cp@delhipolice.gov.in', password: 'CP@1234',
      department: 'CP Secretariat', role: 'cp', loginType: 'officer',
      demoEmail: 'cp@sharklasers.com', assignedRooms: null,
      avatar: 'https://ui-avatars.com/api/?name=Sanjay+Arora&background=DC2626&color=fff&size=128' },
    { id: 'u-scp', name: 'Deepak Yadav', email: 'specialcp@delhipolice.gov.in', password: 'SCP@1234',
      department: 'Special Branch', role: 'special_cp', loginType: 'officer',
      demoEmail: 'specialcp@sharklasers.com', assignedRooms: null,
      avatar: 'https://ui-avatars.com/api/?name=Deepak+Yadav&background=EA580C&color=fff&size=128' },
    { id: 'u-jcp', name: 'Priya Sharma', email: 'jointcp@delhipolice.gov.in', password: 'JCP@1234',
      department: 'L&O / Administration', role: 'joint_cp', loginType: 'officer',
      demoEmail: 'jointcp@sharklasers.com', assignedRooms: null,
      avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=D97706&color=fff&size=128' },
    { id: 'u-adcp', name: 'Vikram Malhotra', email: 'addlcp@delhipolice.gov.in', password: 'ADCP@1234',
      department: 'Crime Branch', role: 'additional_cp', loginType: 'officer',
      demoEmail: 'additionalcp@sharklasers.com', assignedRooms: null,
      avatar: 'https://ui-avatars.com/api/?name=Vikram+Malhotra&background=CA8A04&color=fff&size=128' },
    { id: 'u-dcp', name: 'Amit Singh', email: 'dcp@delhipolice.gov.in', password: 'DCP@1234',
      department: 'DCP/GA', role: 'dcp', loginType: 'officer',
      demoEmail: 'dcp@sharklasers.com', assignedRooms: null,
      avatar: 'https://ui-avatars.com/api/?name=Amit+Singh&background=2563EB&color=fff&size=128' },
    { id: 'u-acp', name: 'Neha Patel', email: 'acp@delhipolice.gov.in', password: 'ACP@1234',
      department: 'Special Cell', role: 'acp', loginType: 'officer',
      demoEmail: 'acp@sharklasers.com', assignedRooms: null,
      avatar: 'https://ui-avatars.com/api/?name=Neha+Patel&background=4F46E5&color=fff&size=128' },
    { id: 'u-si', name: 'Rohit Mehta', email: 'si@delhipolice.gov.in', password: 'SI@1234',
      department: 'Traffic', role: 'si', loginType: 'officer',
      demoEmail: 'si@sharklasers.com', assignedRooms: null,
      avatar: 'https://ui-avatars.com/api/?name=Rohit+Mehta&background=7C3AED&color=fff&size=128' },
    { id: 'u-user', name: 'Kavita Joshi', email: 'user@delhipolice.gov.in', password: 'User@1234',
      department: 'PRO', role: 'user', loginType: 'officer',
      demoEmail: 'officer@sharklasers.com', assignedRooms: null,
      avatar: 'https://ui-avatars.com/api/?name=Kavita+Joshi&background=0891B2&color=fff&size=128' },
  ];

  console.log('[Seed] Inserting users…');
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT);
    await db.query(
      `INSERT INTO users (id,name,email,password_hash,department,role,login_type,demo_email,assigned_rooms,avatar)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         name=$2, email=$3, password_hash=$4, department=$5, role=$6,
         login_type=$7, demo_email=$8, assigned_rooms=$9, avatar=$10`,
      [u.id, u.name, u.email, hash, u.department, u.role, u.loginType, u.demoEmail, u.assignedRooms, u.avatar]
    );
  }

  // ── Rooms ──────────────────────────────────────────────────────────────────
  interface RoomSeed {
    id: string; name: string; roomNumber: string; tower: string; floor: string;
    capacityMin: number; capacityMax: number; status: string;
    managedBy: string; caretakerId: string; type: string;
    amenities: string[]; imgSrc: string; image: string; description: string;
  }

  const rooms: RoomSeed[] = [
    { id:'room-1', name:'Adarsh Auditorium', roomNumber:'GF-AUD', tower:'Tower I', floor:'Ground Floor',
      capacityMin:400, capacityMax:430, status:'available', managedBy:'Managed By - Reception',
      caretakerId:'u-ct-aud', type:'Auditorium',
      amenities:['Projector','Microphone','AC','Stage','Sound System','Video Conferencing','Podium','WiFi'],
      imgSrc:'https://ik.imagekit.io/qwzhnpeqg/0e163374-1f3b-46e4-b428-e10762fb7391.jpg',
      image:'/images/auditorium.jpg',
      description:'The flagship auditorium of Tower I, ideal for large-scale conferences, town halls, and official ceremonies. Features a full stage setup with advanced audio-visual capabilities.' },
    { id:'room-2', name:'Media Conference Hall', roomNumber:'13', tower:'Tower I', floor:'Ground Floor',
      capacityMin:70, capacityMax:90, status:'reserved', managedBy:'Managed By - Media Cell',
      caretakerId:'u-ct-13', type:'Conference Hall',
      amenities:['Projector','Microphone','AC','Video Conferencing','WiFi','Press Podium','Recording Equipment'],
      imgSrc:'https://ik.imagekit.io/gv06viaup/images/media_conf-2.jpeg',
      image:'/images/media-hall.jpg',
      description:'Dedicated conference hall for press briefings, media interactions, and official communications.' },
    { id:'room-3', name:'Room 107', roomNumber:'107', tower:'Tower I', floor:'1st Floor',
      capacityMin:20, capacityMax:30, status:'available', managedBy:'Managed By - HRD',
      caretakerId:'u-ct-107', type:'Conference Hall',
      amenities:['Projector','Whiteboard','AC','WiFi','Video Conferencing'],
      imgSrc:'https://ik.imagekit.io/gv06viaup/images/room_107-3.jpeg',
      image:'/images/room-107.jpg',
      description:'Compact conference hall managed by HRD, suitable for training sessions, interviews, and small departmental meetings.' },
    { id:'room-4', name:'Room 203', roomNumber:'203', tower:'Tower I', floor:'2nd Floor',
      capacityMin:50, capacityMax:80, status:'occupied', managedBy:'Managed By - DCP/GA',
      caretakerId:'u-ct-203', type:'Mini Auditorium',
      amenities:['Projector','Microphone','AC','Video Conferencing','WiFi','Sound System','Whiteboard'],
      imgSrc:'https://ik.imagekit.io/gv06viaup/images/vimarsh-2.jpeg',
      image:'/images/room-203.jpg',
      description:'A mini auditorium on the 2nd floor managed by DCP/GA. Ideal for medium-scale presentations, workshops, and inter-departmental meetings.' },
    { id:'room-5', name:'Room 307', roomNumber:'307', tower:'Tower I', floor:'3rd Floor',
      capacityMin:25, capacityMax:40, status:'available', managedBy:'Managed By - Traffic',
      caretakerId:'u-ct-307', type:'Conference Hall',
      amenities:['Projector','Whiteboard','AC','WiFi','Video Conferencing','Microphone'],
      imgSrc:'https://ik.imagekit.io/gv06viaup/images/room_307-2.jpeg',
      image:'/images/room-307.jpg',
      description:'Conference hall on the 3rd floor managed by Traffic department. Well-suited for strategy meetings and planning sessions.' },
    { id:'room-6', name:'Room 420', roomNumber:'420', tower:'Tower I', floor:'4th Floor',
      capacityMin:15, capacityMax:45, status:'available', managedBy:'Managed By - IT Center',
      caretakerId:'u-ct-420', type:'Conference Hall',
      amenities:['Projector','Whiteboard','AC','WiFi','Video Conferencing','Microphone','Smart TV','HDMI Ports'],
      imgSrc:'https://ik.imagekit.io/qwzhnpeqg/edb5c3bb-f554-427c-8ab2-144fd7d025c6.jpg',
      image:'/images/room-420.jpg',
      description:'Technology-forward conference hall managed by IT Center. Equipped with advanced connectivity options and smart displays for technical presentations.' },
    { id:'room-7', name:'Room 1305', roomNumber:'1305', tower:'Tower I', floor:'13th Floor',
      capacityMin:18, capacityMax:30, status:'reserved', managedBy:'Managed By - DPHCL',
      caretakerId:'u-ct-1305', type:'Conference Hall',
      amenities:['Projector','Whiteboard','AC','WiFi','Video Conferencing'],
      imgSrc:'https://ik.imagekit.io/gv06viaup/images/room_1305-2.jpeg',
      image:'/images/room-1305.jpg',
      description:'Conference hall on the 13th floor managed by DPHCL. A quiet and well-maintained space for focused meetings and discussions.' },
    { id:'room-8', name:'Room 1400', roomNumber:'1400', tower:'Tower I', floor:'14th Floor',
      capacityMin:14, capacityMax:25, status:'available', managedBy:'Managed By - PRO',
      caretakerId:'u-ct-1400', type:'Conference Hall',
      amenities:['Projector','Whiteboard','AC','WiFi','Microphone'],
      imgSrc:'https://ik.imagekit.io/gv06viaup/images/room_1400-3.jpeg',
      image:'/images/room-1400.jpg',
      description:'Intimate conference hall managed by the PRO office. Best suited for small group discussions, press briefings, and coordination meetings.' },
    { id:'room-9', name:'Conference Hall 17th Floor', roomNumber:'1700', tower:'Tower I', floor:'17th Floor',
      capacityMin:30, capacityMax:45, status:'occupied', managedBy:'Managed By - CP Secretariat',
      caretakerId:'u-ct-1700', type:'Conference Hall',
      amenities:['Projector','Microphone','AC','WiFi','Video Conferencing','Sound System','Smart TV'],
      imgSrc:'https://ik.imagekit.io/qwzhnpeqg/cb632f16-8b4d-403b-978f-c00b6c60a690.jpg',
      image:'/images/room-1700.jpg',
      description:'Premium conference hall on the 17th floor managed by CP Secretariat. Reserved for high-level meetings, VIP conferences, and executive sessions.' },
    { id:'room-10', name:'Room 1429', roomNumber:'1429', tower:'Bridge Tower', floor:'14th Floor',
      capacityMin:18, capacityMax:30, status:'available', managedBy:'Managed By - Traffic',
      caretakerId:'u-ct-1429', type:'Conference Hall',
      amenities:['Projector','Whiteboard','AC','WiFi','Video Conferencing','Microphone'],
      imgSrc:'https://ik.imagekit.io/gv06viaup/images/room_1429-2.jpeg',
      image:'/images/room-1429.jpg',
      description:'Bridge Tower conference hall connecting both towers. Managed by Traffic department, offering a unique vantage point and convenient access from both towers.' },
    { id:'room-11', name:'Room 124', roomNumber:'124', tower:'Tower II', floor:'1st Floor',
      capacityMin:25, capacityMax:40, status:'available', managedBy:'Managed By - Reception',
      caretakerId:'u-ct-124', type:'Conference Hall',
      amenities:['Projector','Whiteboard','AC','WiFi','Video Conferencing','Microphone'],
      imgSrc:'https://ik.imagekit.io/qwzhnpeqg/5b04c1ee-b2c2-42d3-871f-e4d2658bc69d.jpg',
      image:'/images/room-124.jpg',
      description:'Versatile conference hall on the 1st floor of Tower II. Managed by Reception, frequently used for visitor meetings and welcome orientations.' },
    { id:'room-12', name:'Room 216', roomNumber:'216', tower:'Tower II', floor:'2nd Floor',
      capacityMin:25, capacityMax:40, status:'reserved', managedBy:'Managed By - L&O Zone-1',
      caretakerId:'u-ct-216', type:'Conference Hall',
      amenities:['Projector','Whiteboard','AC','WiFi','Video Conferencing','Microphone'],
      imgSrc:'https://ik.imagekit.io/gv06viaup/images/room_216-3.jpeg',
      image:'/images/room-216.jpg',
      description:'Conference hall managed by L&O Zone-1. Designed for law and order coordination meetings, briefings, and inter-zone discussions.' },
    { id:'room-13', name:'Room 326', roomNumber:'326', tower:'Tower II', floor:'3rd Floor',
      capacityMin:30, capacityMax:50, status:'available', managedBy:'Managed By - Reception',
      caretakerId:'u-ct-326', type:'Conference Hall',
      amenities:['Projector','Whiteboard','AC','WiFi','Video Conferencing','Microphone','Sound System'],
      imgSrc:'https://ik.imagekit.io/gv06viaup/images/room_326-2.jpeg',
      image:'/images/room-326.jpg',
      description:'Spacious conference hall on the 3rd floor of Tower II. Managed by Reception, ideal for larger departmental meetings and collaborative sessions.' },
    { id:'room-14', name:'Room 727', roomNumber:'727', tower:'Tower II', floor:'7th Floor',
      capacityMin:30, capacityMax:60, status:'occupied', managedBy:'Managed By - Special Cell',
      caretakerId:'u-ct-727', type:'Conference Hall',
      amenities:['Projector','Microphone','AC','WiFi','Video Conferencing','Sound System','Whiteboard','Smart TV'],
      imgSrc:'https://ik.imagekit.io/gv06viaup/images/room_727-4.jpeg',
      image:'/images/room-727.jpg',
      description:'High-capacity conference hall managed by Special Cell. Features enhanced security provisions and is suitable for sensitive briefings and large team assemblies.' },
  ];

  console.log('[Seed] Inserting rooms…');
  for (const r of rooms) {
    await db.query(
      `INSERT INTO rooms (id,name,room_number,tower,floor,capacity_min,capacity_max,status,managed_by,caretaker_id,type,amenities,img_src,image,description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET
         name=$2, room_number=$3, tower=$4, floor=$5, capacity_min=$6, capacity_max=$7,
         managed_by=$9, caretaker_id=$10, type=$11, amenities=$12, img_src=$13, image=$14, description=$15`,
      [r.id, r.name, r.roomNumber, r.tower, r.floor, r.capacityMin, r.capacityMax,
       r.status, r.managedBy, r.caretakerId, r.type, r.amenities, r.imgSrc, r.image, r.description]
    );
  }

  // ── Bookings (sample data for dashboards/charts) ──────────────────────────
  // Use PostgreSQL date arithmetic so dates stay relative to when seed runs
  console.log('[Seed] Inserting sample bookings…');

  const bookingSeed = `
    INSERT INTO bookings (id, room_id, user_id, title, description, organizer, participants_count, date, start_time, end_time, status, created_at)
    VALUES
      ('booking-1',  'room-1',  'u-cp',   'Annual Crime Review Conference',       'Review of annual crime statistics and strategy.',         'Sanjay Arora, CP',        350, CURRENT_DATE - 14, '10:00', '13:00', 'completed', NOW() - INTERVAL '20 days'),
      ('booking-2',  'room-2',  'u-scp',  'Media Briefing – Operation Suraksha',  'Press briefing on Operation Suraksha outcomes.',          'Deepak Yadav, Spl. CP',    60, CURRENT_DATE - 13, '11:00', '12:30', 'completed', NOW() - INTERVAL '18 days'),
      ('booking-3',  'room-3',  'u-dcp',  'HRD Training Session',                 'Annual HRD training for constables.',                     'Amit Singh, DCP',          25, CURRENT_DATE - 12, '09:00', '11:00', 'completed', NOW() - INTERVAL '17 days'),
      ('booking-4',  'room-4',  'u-jcp',  'L&O Zone Review Meeting',              'Monthly law and order zone review.',                      'Priya Sharma, Jt. CP',     70, CURRENT_DATE - 11, '14:00', '16:00', 'completed', NOW() - INTERVAL '16 days'),
      ('booking-5',  'room-5',  'u-acp',  'Traffic Management Workshop',          'Workshop on traffic management improvements.',            'Neha Patel, ACP',          35, CURRENT_DATE - 10, '10:00', '12:00', 'completed', NOW() - INTERVAL '15 days'),
      ('booking-6',  'room-6',  'u-adcp', 'Crime Branch Strategy Meeting',        'Strategy session for Crime Branch operations.',           'Vikram Malhotra, Addl.CP', 20, CURRENT_DATE - 9,  '15:00', '17:00', 'completed', NOW() - INTERVAL '14 days'),
      ('booking-7',  'room-7',  'u-si',   'Sub-Inspector Coordination Meet',      'Monthly SI coordination and briefing.',                   'Rohit Mehta, SI',          28, CURRENT_DATE - 8,  '09:00', '10:30', 'completed', NOW() - INTERVAL '13 days'),
      ('booking-8',  'room-9',  'u-cp',   'Commissioner Review – Q2',             'Quarterly performance review with all DCPs.',             'Sanjay Arora, CP',         40, CURRENT_DATE - 7,  '10:00', '13:00', 'completed', NOW() - INTERVAL '12 days'),
      ('booking-9',  'room-11', 'u-jcp',  'Visitor Orientation Session',          'Orientation for new recruit batch.',                      'Priya Sharma, Jt. CP',     38, CURRENT_DATE - 6,  '11:00', '12:30', 'completed', NOW() - INTERVAL '11 days'),
      ('booking-10', 'room-13', 'u-dcp',  'Reception Coordination Meet',          'Coordination with reception and admin staff.',            'Amit Singh, DCP',          32, CURRENT_DATE - 5,  '14:00', '15:30', 'completed', NOW() - INTERVAL '10 days'),
      ('booking-11', 'room-14', 'u-scp',  'Special Cell Briefing',               'Classified briefing for Special Cell officers.',          'Deepak Yadav, Spl. CP',    45, CURRENT_DATE - 4,  '10:00', '12:00', 'completed', NOW() - INTERVAL '9 days'),
      ('booking-12', 'room-2',  'u-adcp', 'Press Conference – Crime Stats',       'Annual crime statistics press release.',                  'Vikram Malhotra, Addl.CP', 65, CURRENT_DATE - 3,  '11:00', '12:30', 'completed', NOW() - INTERVAL '8 days'),
      ('booking-13', 'room-3',  'u-acp',  'Departmental Interview Panel',         'Interview panel for ACP vacancy.',                       'Neha Patel, ACP',          22, CURRENT_DATE - 2,  '09:00', '13:00', 'completed', NOW() - INTERVAL '7 days'),
      ('booking-14', 'room-5',  'u-si',   'Traffic Beat Officer Meeting',         'Monthly beat officer briefing.',                         'Rohit Mehta, SI',          30, CURRENT_DATE - 1,  '15:00', '16:30', 'completed', NOW() - INTERVAL '6 days'),
      ('booking-15', 'room-1',  'u-cp',   'Independence Day Ceremony Prep',       'Preparation meeting for Independence Day function.',     'Sanjay Arora, CP',        300, CURRENT_DATE,       '09:00', '11:00', 'confirmed', NOW() - INTERVAL '5 days'),
      ('booking-16', 'room-4',  'u-jcp',  'Zone-1 Law & Order Review',           'Today''s zone review with all SHOs.',                    'Priya Sharma, Jt. CP',     75, CURRENT_DATE,       '14:00', '16:00', 'ongoing',   NOW() - INTERVAL '4 days'),
      ('booking-17', 'room-6',  'u-dcp',  'IT Infrastructure Discussion',         'Discussion on PHQ IT upgrades.',                         'Amit Singh, DCP',          18, CURRENT_DATE,       '17:00', '18:30', 'confirmed', NOW() - INTERVAL '3 days'),
      ('booking-18', 'room-8',  'u-user', 'PRO Team Coordination',               'Weekly PRO coordination meeting.',                       'Kavita Joshi',             15, CURRENT_DATE + 1,   '10:00', '11:30', 'confirmed', NOW() - INTERVAL '2 days'),
      ('booking-19', 'room-9',  'u-cp',   'CP Secretariat Monthly Review',        'Monthly review with CP Secretariat staff.',              'Sanjay Arora, CP',         40, CURRENT_DATE + 2,   '11:00', '13:00', 'confirmed', NOW() - INTERVAL '2 days'),
      ('booking-20', 'room-10', 'u-adcp', 'Bridge Tower – Crime Branch Meet',     'Inter-tower crime branch coordination.',                  'Vikram Malhotra, Addl.CP', 25, CURRENT_DATE + 3,   '14:00', '16:00', 'confirmed', NOW() - INTERVAL '1 day'),
      ('booking-21', 'room-11', 'u-scp',  'Special Branch Debrief',              'Post-operation debrief session.',                        'Deepak Yadav, Spl. CP',    30, CURRENT_DATE + 4,   '10:00', '12:00', 'reserved',  NOW() - INTERVAL '1 day'),
      ('booking-22', 'room-3',  'u-acp',  'ACP Training Program – Batch 3',      'Training program for ACP batch 3.',                      'Neha Patel, ACP',          28, CURRENT_DATE + 5,   '09:00', '12:00', 'confirmed', NOW()),
      ('booking-23', 'room-5',  'u-si',   'Traffic Analysis Meet',               'Monthly traffic data analysis session.',                 'Rohit Mehta, SI',          20, CURRENT_DATE + 6,   '14:00', '15:30', 'confirmed', NOW()),
      ('booking-24', 'room-7',  'u-dcp',  'DPHCL Policy Discussion',             'Policy discussion with DPHCL representatives.',          'Amit Singh, DCP',          22, CURRENT_DATE + 7,   '10:00', '12:00', 'reserved',  NOW()),
      ('booking-25', 'room-2',  'u-jcp',  'Press Meet – Festive Season Safety',  'Press meet on festive season safety measures.',          'Priya Sharma, Jt. CP',     80, CURRENT_DATE + 8,   '11:00', '12:30', 'confirmed', NOW()),
      ('booking-26', 'room-1',  'u-cp',   'Annual General Conference',            'All-officer annual general conference at PHQ.',          'Sanjay Arora, CP',        420, CURRENT_DATE + 10,  '09:00', '17:00', 'confirmed', NOW()),
      ('booking-27', 'room-13', 'u-adcp', 'Reception Staff Review',              'Quarterly review with reception and admin.',             'Vikram Malhotra, Addl.CP', 35, CURRENT_DATE + 12,  '14:00', '15:30', 'confirmed', NOW()),
      ('booking-28', 'room-14', 'u-scp',  'Special Cell Annual Review',          'Annual review of Special Cell operations.',              'Deepak Yadav, Spl. CP',    55, CURRENT_DATE + 14,  '10:00', '13:00', 'reserved',  NOW()),
      ('booking-29', 'room-4',  'u-acp',  'Mini Auditorium Workshop',            'Workshop on new policing techniques.',                   'Neha Patel, ACP',          60, CURRENT_DATE - 3,   '09:00', '11:00', 'cancelled', NOW() - INTERVAL '5 days'),
      ('booking-30', 'room-6',  'u-user', 'PRO Media Training',                  'Media handling training for PRO staff.',                 'Kavita Joshi',             15, CURRENT_DATE - 1,   '13:00', '14:30', 'cancelled', NOW() - INTERVAL '3 days')
    ON CONFLICT (id) DO NOTHING;
  `;

  await db.query(bookingSeed);

  console.log('[Seed] Done. ✓');
  await db.end();
}

seed().catch((err) => { console.error('[Seed] Error:', err); process.exit(1); });
