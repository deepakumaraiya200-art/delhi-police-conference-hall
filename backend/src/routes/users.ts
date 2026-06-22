import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client.js';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';
import { toUser, type UserRow } from '../types/index.js';

const router = Router();
router.use(requireAuth);

// GET /api/users — admin only
router.get('/', requireRole('admin'), async (_req, res: Response) => {
  const { rows } = await db.query<UserRow>('SELECT * FROM users ORDER BY login_type, role, name');
  res.json(rows.map(toUser));
});

// GET /api/users/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { rows } = await db.query<UserRow>('SELECT * FROM users WHERE id = $1', [req.params.id]);
  if (!rows[0]) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(toUser(rows[0]));
});

// POST /api/users — admin only
router.post('/', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { name, email, password, department, role, loginType, demoEmail, assignedRooms, avatar } = req.body;
  if (!name || !email || !password || !role || !loginType) {
    res.status(400).json({ error: 'name, email, password, role and loginType are required' });
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  const id = `u-${uuidv4().slice(0, 8)}`;
  const { rows } = await db.query<UserRow>(
    `INSERT INTO users (id, name, email, password_hash, department, role, login_type, demo_email, assigned_rooms, avatar)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [id, name, email, hash, department ?? '', role, loginType, demoEmail ?? null, assignedRooms ?? null, avatar ?? null]
  );
  res.status(201).json(toUser(rows[0]));
});

// PUT /api/users/:id — admin or self
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user?.role === 'admin';
  const isSelf  = req.user?.userId === req.params.id;
  if (!isAdmin && !isSelf) { res.status(403).json({ error: 'Forbidden' }); return; }

  const { name, email, department, role, loginType, demoEmail, assignedRooms, avatar, password } = req.body;

  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (name)          { updates.push(`name=$${i++}`);          values.push(name); }
  if (email)         { updates.push(`email=$${i++}`);         values.push(email); }
  if (department)    { updates.push(`department=$${i++}`);    values.push(department); }
  if (isAdmin && role)       { updates.push(`role=$${i++}`);       values.push(role); }
  if (isAdmin && loginType)  { updates.push(`login_type=$${i++}`); values.push(loginType); }
  if (demoEmail !== undefined) { updates.push(`demo_email=$${i++}`); values.push(demoEmail || null); }
  if (assignedRooms) { updates.push(`assigned_rooms=$${i++}`); values.push(assignedRooms); }
  if (avatar)        { updates.push(`avatar=$${i++}`);        values.push(avatar); }
  if (password)      { const h = await bcrypt.hash(password, 12); updates.push(`password_hash=$${i++}`); values.push(h); }

  if (!updates.length) { res.status(400).json({ error: 'Nothing to update' }); return; }

  values.push(req.params.id);
  const { rows } = await db.query<UserRow>(
    `UPDATE users SET ${updates.join(', ')} WHERE id=$${i} RETURNING *`,
    values
  );
  if (!rows[0]) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(toUser(rows[0]));
});

// DELETE /api/users/:id — admin only
router.delete('/:id', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { rowCount } = await db.query('DELETE FROM users WHERE id=$1', [req.params.id]);
  if (!rowCount) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ success: true });
});

export default router;
