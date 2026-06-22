import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { toBooking, isSeniorTo, getRankLabel, type BookingRow, type UserRow } from '../types/index.js';

const router = Router();
router.use(requireAuth);

// ── Conflict helpers ─────────────────────────────────────────────────────────

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

const BUFFER = 30;

async function findConflict(
  roomId: string, date: string, startTime: string, endTime: string, excludeId?: string
): Promise<BookingRow | null> {
  const { rows } = await db.query<BookingRow>(
    `SELECT * FROM bookings WHERE room_id=$1 AND date=$2 AND status NOT IN ('cancelled','completed') ${excludeId ? 'AND id!=$3' : ''}`,
    excludeId ? [roomId, date, excludeId] : [roomId, date]
  );

  const newStart = toMinutes(startTime);
  const newEnd   = toMinutes(endTime);

  for (const b of rows) {
    const bStart = toMinutes(b.start_time);
    const bEnd   = toMinutes(b.end_time);
    if (newStart < bEnd && newEnd > bStart) return b;
    if (newStart >= bEnd  && newStart < bEnd  + BUFFER) return b;
    if (newEnd   <= bStart && newEnd   > bStart - BUFFER) return b;
  }
  return null;
}

// ── GET /api/bookings ────────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const rows = isAdmin
      ? (await db.query<BookingRow>('SELECT * FROM bookings ORDER BY date DESC, start_time')).rows
      : (await db.query<BookingRow>(
          'SELECT * FROM bookings WHERE user_id=$1 ORDER BY date DESC, start_time',
          [req.user?.userId]
        )).rows;
    res.json(rows.map(toBooking));
  } catch (err) {
    console.error('[GET /bookings]', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// ── GET /api/bookings/upcoming ───────────────────────────────────────────────
router.get('/upcoming', async (_req, res: Response) => {
  try {
    const { rows } = await db.query<BookingRow>(
      `SELECT * FROM bookings WHERE date >= CURRENT_DATE AND status IN ('confirmed','reserved','ongoing') ORDER BY date, start_time`
    );
    res.json(rows.map(toBooking));
  } catch (err) {
    console.error('[GET /bookings/upcoming]', err);
    res.status(500).json({ error: 'Failed to fetch upcoming bookings' });
  }
});

// ── GET /api/bookings/today ──────────────────────────────────────────────────
router.get('/today', async (_req, res: Response) => {
  try {
    const { rows } = await db.query<BookingRow>(
      `SELECT * FROM bookings WHERE date = CURRENT_DATE AND status != 'cancelled' ORDER BY start_time`
    );
    res.json(rows.map(toBooking));
  } catch (err) {
    console.error('[GET /bookings/today]', err);
    res.status(500).json({ error: 'Failed to fetch today\'s bookings' });
  }
});

// ── GET /api/bookings/room/:roomId ───────────────────────────────────────────
router.get('/room/:roomId', async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await db.query<BookingRow>(
      'SELECT * FROM bookings WHERE room_id=$1 ORDER BY date DESC, start_time',
      [req.params.roomId]
    );
    res.json(rows.map(toBooking));
  } catch (err) {
    console.error('[GET /bookings/room/:roomId]', err);
    res.status(500).json({ error: 'Failed to fetch room bookings' });
  }
});

// ── GET /api/bookings/user/:userId ───────────────────────────────────────────
router.get('/user/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const isSelf  = req.user?.userId === req.params.userId;
    if (!isAdmin && !isSelf) { res.status(403).json({ error: 'Forbidden' }); return; }

    const { rows } = await db.query<BookingRow>(
      'SELECT * FROM bookings WHERE user_id=$1 ORDER BY date DESC, start_time',
      [req.params.userId]
    );
    res.json(rows.map(toBooking));
  } catch (err) {
    console.error('[GET /bookings/user/:userId]', err);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

// ── GET /api/bookings/:id ────────────────────────────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await db.query<BookingRow>('SELECT * FROM bookings WHERE id=$1', [req.params.id]);
    if (!rows[0]) { res.status(404).json({ error: 'Booking not found' }); return; }
    res.json(toBooking(rows[0]));
  } catch (err) {
    console.error('[GET /bookings/:id]', err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// ── POST /api/bookings ───────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, title, description, organizer, participantsCount, date, startTime, endTime, status } = req.body;
    const userId = req.user!.userId;

    if (!roomId || !title || !date || !startTime || !endTime) {
      res.status(400).json({ error: 'roomId, title, date, startTime and endTime are required' });
      return;
    }
    if (toMinutes(startTime) >= toMinutes(endTime)) {
      res.status(400).json({ error: 'End time must be after start time' });
      return;
    }

    // Fetch room name once — used in all notifications
    const roomRow = (await db.query('SELECT name FROM rooms WHERE id=$1', [roomId])).rows[0];
    const roomName = roomRow?.name ?? roomId;

    // Check for conflicts & senior override
    const conflict = await findConflict(roomId, date, startTime, endTime);
    const cancelledBookings: ReturnType<typeof toBooking>[] = [];

    if (conflict) {
      const juniorUser = (await db.query<UserRow>('SELECT * FROM users WHERE id=$1', [conflict.user_id])).rows[0];
      const seniorUser = (await db.query<UserRow>('SELECT * FROM users WHERE id=$1', [userId])).rows[0];

      if (!seniorUser || !juniorUser || !isSeniorTo(seniorUser.role, juniorUser.role)) {
        res.status(409).json({
          error: `Time slot conflict: "${conflict.title}" by ${getRankLabel(juniorUser?.role ?? 'officer')} ${juniorUser?.name ?? ''} (${conflict.start_time}–${conflict.end_time}) already occupies this slot including the 30-min buffer.`,
          conflictBookingId: conflict.id,
          conflictTitle: conflict.title,
          conflictStartTime: conflict.start_time,
          conflictEndTime: conflict.end_time,
        });
        return;
      }

      // Senior override — check 30-min rule
      const meetingStart = new Date(`${conflict.date}T${conflict.start_time}:00`);
      const minutesUntil = (meetingStart.getTime() - Date.now()) / 60000;
      if (minutesUntil <= BUFFER) {
        res.status(409).json({ error: `Cannot override: less than 30 minutes until "${conflict.title}" starts.` });
        return;
      }

      // Cancel junior booking
      const { rows: cancelled } = await db.query<BookingRow>(
        `UPDATE bookings SET status='cancelled', cancel_reason=$1, overridden_by=$2 WHERE id=$3 RETURNING *`,
        [`Overridden by ${getRankLabel(seniorUser.role)} ${seniorUser.name}`, userId, conflict.id]
      );
      if (cancelled[0]) cancelledBookings.push(toBooking(cancelled[0]));

      // Notify junior
      await db.query(
        `INSERT INTO notifications (id, user_id, type, message) VALUES ($1,$2,'booking_overridden',$3)`,
        [`n-${uuidv4().slice(0, 8)}`, juniorUser.id,
          `Your booking "${conflict.title}" in ${roomName} on ${date} was overridden by ${getRankLabel(seniorUser.role)} ${seniorUser.name}. Please book another available hall.`]
      );

      // Notify caretaker of that room
      const caretakerRow = (await db.query(
        `SELECT id FROM users WHERE $1=ANY(assigned_rooms) AND login_type='caretaker' LIMIT 1`, [roomId]
      )).rows[0];
      if (caretakerRow) {
        await db.query(
          `INSERT INTO notifications (id, user_id, type, message) VALUES ($1,$2,'booking_overridden',$3)`,
          [`n-${uuidv4().slice(0, 8)}`, caretakerRow.id,
            `${roomName}: "${conflict.title}" (${getRankLabel(juniorUser.role)} ${juniorUser.name}) was overridden by ${getRankLabel(seniorUser.role)} ${seniorUser.name} for ${date} ${startTime}–${endTime}.`]
        );
      }

      // Notify admin
      const adminRow = (await db.query(`SELECT id FROM users WHERE role='admin' LIMIT 1`)).rows[0];
      if (adminRow) {
        await db.query(
          `INSERT INTO notifications (id, user_id, type, message) VALUES ($1,$2,'booking_overridden',$3)`,
          [`n-${uuidv4().slice(0, 8)}`, adminRow.id,
            `[Override] ${getRankLabel(seniorUser.role)} ${seniorUser.name} overrode "${conflict.title}" (by ${getRankLabel(juniorUser.role)} ${juniorUser.name}) in ${roomName} on ${date}.`]
        );
      }
    }

    const id = `booking-${uuidv4().slice(0, 8)}`;
    const { rows } = await db.query<BookingRow>(
      `INSERT INTO bookings (id, room_id, user_id, title, description, organizer, participants_count, date, start_time, end_time, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, roomId, userId, title, description ?? '', organizer ?? req.user!.name,
       participantsCount ?? 1, date, startTime, endTime, status ?? 'confirmed']
    );

    // Confirmation notification to the booking creator (not about override — just "your booking is confirmed")
    await db.query(
      `INSERT INTO notifications (id, user_id, type, message) VALUES ($1,$2,'booking_confirmed',$3)`,
      [`n-${uuidv4().slice(0, 8)}`, userId,
        `Your booking "${title}" in ${roomName} on ${date} (${startTime}–${endTime}) has been confirmed.`]
    );

    res.status(201).json({ booking: toBooking(rows[0]), cancelledBookings });
  } catch (err) {
    console.error('[POST /bookings]', err);
    res.status(500).json({ error: 'Failed to create booking. Please try again.' });
  }
});

// ── PUT /api/bookings/:id ────────────────────────────────────────────────────
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { rows: existing } = await db.query<BookingRow>('SELECT * FROM bookings WHERE id=$1', [req.params.id]);
    if (!existing[0]) { res.status(404).json({ error: 'Booking not found' }); return; }

    const isAdmin = req.user?.role === 'admin';
    const isOwner = existing[0].user_id === req.user?.userId;
    if (!isAdmin && !isOwner) { res.status(403).json({ error: 'Forbidden' }); return; }

    const { title, description, organizer, participantsCount, date, startTime, endTime, status, mom } = req.body;

    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (title)             { updates.push(`title=$${i++}`);             values.push(title); }
    if (description)       { updates.push(`description=$${i++}`);       values.push(description); }
    if (organizer)         { updates.push(`organizer=$${i++}`);         values.push(organizer); }
    if (participantsCount) { updates.push(`participants_count=$${i++}`); values.push(participantsCount); }
    if (date)              { updates.push(`date=$${i++}`);              values.push(date); }
    if (startTime)         { updates.push(`start_time=$${i++}`);        values.push(startTime); }
    if (endTime)           { updates.push(`end_time=$${i++}`);          values.push(endTime); }
    if (status)            { updates.push(`status=$${i++}`);            values.push(status); }
    if (mom !== undefined) { updates.push(`mom=$${i++}`);               values.push(mom); }

    if (!updates.length) { res.status(400).json({ error: 'Nothing to update' }); return; }

    values.push(req.params.id);
    const { rows } = await db.query<BookingRow>(
      `UPDATE bookings SET ${updates.join(',')} WHERE id=$${i} RETURNING *`, values
    );
    res.json(toBooking(rows[0]));
  } catch (err) {
    console.error('[PUT /bookings/:id]', err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// ── PATCH /api/bookings/:id/cancel ──────────────────────────────────────────
router.patch('/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const { rows: existing } = await db.query<BookingRow>('SELECT * FROM bookings WHERE id=$1', [req.params.id]);
    if (!existing[0]) { res.status(404).json({ error: 'Booking not found' }); return; }

    const isAdmin = req.user?.role === 'admin';
    const isOwner = existing[0].user_id === req.user?.userId;
    if (!isAdmin && !isOwner) { res.status(403).json({ error: 'Forbidden' }); return; }

    const { reason } = req.body as { reason?: string };
    const { rows } = await db.query<BookingRow>(
      `UPDATE bookings SET status='cancelled', cancel_reason=$1 WHERE id=$2 RETURNING *`,
      [reason ?? null, req.params.id]
    );
    res.json(toBooking(rows[0]));
  } catch (err) {
    console.error('[PATCH /bookings/:id/cancel]', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// ── PATCH /api/bookings/:id/mos — caretaker or admin submits meeting notes ──
router.patch('/:id/mos', async (req: AuthRequest, res: Response) => {
  try {
    const { mom } = req.body as { mom: string };
    if (!mom?.trim()) { res.status(400).json({ error: 'Meeting notes (mom) are required' }); return; }

    const { rows: existing } = await db.query<BookingRow>('SELECT * FROM bookings WHERE id=$1', [req.params.id]);
    if (!existing[0]) { res.status(404).json({ error: 'Booking not found' }); return; }

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin) {
      if (req.user?.loginType !== 'caretaker') {
        res.status(403).json({ error: 'Only caretakers and admins can submit meeting notes' }); return;
      }
      const { rows: uRows } = await db.query<UserRow>('SELECT assigned_rooms FROM users WHERE id=$1', [req.user.userId]);
      const assignedRooms: string[] = uRows[0]?.assigned_rooms ?? [];
      if (!assignedRooms.includes(existing[0].room_id)) {
        res.status(403).json({ error: 'You are not assigned to this room' }); return;
      }
    }

    const { rows } = await db.query<BookingRow>(
      `UPDATE bookings SET mom=$1 WHERE id=$2 RETURNING *`,
      [mom.trim(), req.params.id]
    );
    res.json(toBooking(rows[0]));
  } catch (err) {
    console.error('[PATCH /bookings/:id/mos]', err);
    res.status(500).json({ error: 'Failed to submit meeting notes' });
  }
});

// ── PATCH /api/bookings/:id/complete ────────────────────────────────────────
router.patch('/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await db.query<BookingRow>(
      `UPDATE bookings SET status='completed' WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!rows[0]) { res.status(404).json({ error: 'Booking not found' }); return; }
    res.json(toBooking(rows[0]));
  } catch (err) {
    console.error('[PATCH /bookings/:id/complete]', err);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
});

// ── PATCH /api/bookings/:id/ongoing ─────────────────────────────────────────
router.patch('/:id/ongoing', async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await db.query<BookingRow>(
      `UPDATE bookings SET status='ongoing' WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!rows[0]) { res.status(404).json({ error: 'Booking not found' }); return; }
    res.json(toBooking(rows[0]));
  } catch (err) {
    console.error('[PATCH /bookings/:id/ongoing]', err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

export default router;
