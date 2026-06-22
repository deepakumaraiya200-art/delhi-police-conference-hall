import { Router, Response } from 'express';
import { db } from '../db/client.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';
import { toRoom, type RoomRow, type RoomStatus } from '../types/index.js';

const router = Router();
router.use(requireAuth);

// GET /api/rooms
router.get('/', async (_req, res: Response) => {
  const { rows } = await db.query<RoomRow>('SELECT * FROM rooms ORDER BY tower, floor, room_number');
  res.json(rows.map(toRoom));
});

// GET /api/rooms/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { rows } = await db.query<RoomRow>('SELECT * FROM rooms WHERE id=$1', [req.params.id]);
  if (!rows[0]) { res.status(404).json({ error: 'Room not found' }); return; }
  res.json(toRoom(rows[0]));
});

// PATCH /api/rooms/:id/status — admin or caretaker assigned to this room
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  const { status } = req.body as { status: RoomStatus };
  const valid: RoomStatus[] = ['available', 'occupied', 'reserved', 'under_maintenance'];
  if (!valid.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });
    return;
  }

  const isAdmin = req.user?.role === 'admin';
  if (!isAdmin) {
    // Caretaker may only update their assigned room
    const { rows } = await db.query(
      `SELECT 1 FROM users WHERE id=$1 AND login_type='caretaker' AND $2=ANY(assigned_rooms)`,
      [req.user?.userId, req.params.id]
    );
    if (!rows.length) {
      res.status(403).json({ error: 'You are not assigned to this room' });
      return;
    }
  }

  const { rows } = await db.query<RoomRow>(
    'UPDATE rooms SET status=$1 WHERE id=$2 RETURNING *',
    [status, req.params.id]
  );
  if (!rows[0]) { res.status(404).json({ error: 'Room not found' }); return; }
  res.json(toRoom(rows[0]));
});

export default router;
