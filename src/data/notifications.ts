import { format, subHours, subDays, subMinutes } from 'date-fns';
import type { Notification } from '@/types';

const now = new Date();

function fmtDateTime(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm:ss");
}

export const notifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'booking_confirmed',
    message: 'Your booking for "All Hands Town Hall" at Adarsh Auditorium has been confirmed.',
    timestamp: fmtDateTime(subMinutes(now, 15)),
    read: false,
    userId: 'user-7',
  },
  {
    id: 'notif-2',
    type: 'booking_reminder',
    message: 'Reminder: "Server Migration Planning" in Room 420 starts in 1 hour.',
    timestamp: fmtDateTime(subMinutes(now, 30)),
    read: false,
    userId: 'user-1',
  },
  {
    id: 'notif-3',
    type: 'booking_cancelled',
    message: 'Booking "Maintenance Budget Discussion" at Room 1305 has been cancelled.',
    timestamp: fmtDateTime(subHours(now, 2)),
    read: false,
    userId: 'user-9',
  },
  {
    id: 'notif-4',
    type: 'room_status_change',
    message: 'Room 203 (Mini Auditorium) is now available for booking.',
    timestamp: fmtDateTime(subHours(now, 3)),
    read: true,
    userId: 'user-1',
  },
  {
    id: 'notif-5',
    type: 'new_booking',
    message: 'New booking created: "Client Presentation - Smart Policing" at Room 203.',
    timestamp: fmtDateTime(subHours(now, 4)),
    read: true,
    userId: 'user-6',
  },
  {
    id: 'notif-6',
    type: 'booking_confirmed',
    message: 'Your booking for "Promotion Interview Panel" at Room 107 has been confirmed.',
    timestamp: fmtDateTime(subHours(now, 5)),
    read: true,
    userId: 'user-14',
  },
  {
    id: 'notif-7',
    type: 'system',
    message: 'System maintenance scheduled for this weekend. Some features may be temporarily unavailable.',
    timestamp: fmtDateTime(subHours(now, 8)),
    read: false,
    userId: 'user-1',
  },
  {
    id: 'notif-8',
    type: 'booking_reminder',
    message: 'Reminder: "Media Interaction - Anti-Drug Campaign" at Media Conference Hall starts tomorrow.',
    timestamp: fmtDateTime(subDays(now, 1)),
    read: true,
    userId: 'user-5',
  },
  {
    id: 'notif-9',
    type: 'new_booking',
    message: 'New booking created: "Republic Day Security Planning" at Adarsh Auditorium.',
    timestamp: fmtDateTime(subDays(now, 1)),
    read: false,
    userId: 'user-7',
  },
  {
    id: 'notif-10',
    type: 'booking_cancelled',
    message: 'Booking "Zone Coordination Meeting" at Room 1429 has been cancelled by the organizer.',
    timestamp: fmtDateTime(subDays(now, 2)),
    read: true,
    userId: 'user-13',
  },
  {
    id: 'notif-11',
    type: 'room_status_change',
    message: 'Conference Hall 17th Floor is now occupied.',
    timestamp: fmtDateTime(subDays(now, 2)),
    read: true,
    userId: 'user-1',
  },
  {
    id: 'notif-12',
    type: 'system',
    message: 'New conference rooms have been added to the booking system. Check the rooms page for details.',
    timestamp: fmtDateTime(subDays(now, 3)),
    read: true,
    userId: 'user-1',
  },
];
