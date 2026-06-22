import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { toNotification, type NotificationRow } from '../types/index.js';

const router = Router();
router.use(requireAuth);

// GET /api/notifications — current user's notifications
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await db.query<NotificationRow>(
      'SELECT * FROM notifications WHERE user_id=$1 ORDER BY timestamp DESC LIMIT 50',
      [req.user!.userId]
    );
    res.json(rows.map(toNotification));
  } catch (err) {
    console.error('[GET /notifications]', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/read-all — must come before /:id routes
router.patch('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await db.query('UPDATE notifications SET read=TRUE WHERE user_id=$1', [req.user!.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('[PATCH /notifications/read-all]', err);
    res.status(500).json({ error: 'Failed to mark notifications read' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    await db.query(
      'UPDATE notifications SET read=TRUE WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user!.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[PATCH /notifications/:id/read]', err);
    res.status(500).json({ error: 'Failed to mark notification read' });
  }
});

// POST /api/notifications — internal / admin use
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { userId, type, message } = req.body;
    if (!userId || !message) {
      res.status(400).json({ error: 'userId and message are required' });
      return;
    }
    const id = `n-${uuidv4().slice(0, 8)}`;
    const { rows } = await db.query<NotificationRow>(
      'INSERT INTO notifications (id, user_id, type, message) VALUES ($1,$2,$3,$4) RETURNING *',
      [id, userId, type ?? 'system', message]
    );
    res.status(201).json(toNotification(rows[0]));
  } catch (err) {
    console.error('[POST /notifications]', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

export default router;
