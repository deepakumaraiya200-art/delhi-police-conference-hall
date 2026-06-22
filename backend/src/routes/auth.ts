import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { db } from '../db/client.js';
import { sendOTPEmail } from '../services/emailService.js';
import { toUser, type UserRow } from '../types/index.js';

const router = Router();

const otpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5, message: { error: 'Too many OTP requests. Try again later.' } });

// ── POST /api/auth/request-otp ───────────────────────────────────────────────
// Validates email + password + portal, generates OTP, sends to demoEmail.
router.post('/request-otp', otpLimiter, async (req: Request, res: Response) => {
  const { email, password, loginType } = req.body as { email: string; password: string; loginType: string };

  if (!email || !password || !loginType) {
    res.status(400).json({ error: 'email, password and loginType are required' });
    return;
  }

  const { rows } = await db.query<UserRow>(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email.trim()]
  );

  const user = rows[0];

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  if (user.login_type !== loginType) {
    const portalName = user.login_type === 'admin' ? 'Admin' : user.login_type === 'caretaker' ? 'Caretaker' : 'Officer';
    res.status(401).json({ error: `This account must log in via the "${portalName}" portal.` });
    return;
  }

  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  if (!user.demo_email) {
    res.status(400).json({ error: 'No demo email configured for this account. Ask admin to set a yopmail address.' });
    return;
  }

  // Invalidate old OTPs for this email
  await db.query('UPDATE otp_tokens SET used = TRUE WHERE email = LOWER($1) AND used = FALSE', [email]);

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.query(
    'INSERT INTO otp_tokens (email, otp, expires_at) VALUES (LOWER($1), $2, $3)',
    [email, otp, expiresAt]
  );

  try {
    await sendOTPEmail(user.demo_email, user.name, otp);
    console.log(`[OTP] Sent to ${user.demo_email} for ${email}`);
  } catch (err) {
    // Log and fall back to console so demo still works if SMTP not configured
    console.error('[OTP] Email failed, falling back to console:', err);
    console.log(`[Delhi Police Demo] OTP for ${email}: ${otp}`);
  }

  res.json({ message: `OTP sent to demo email: ${user.demo_email}`, demoEmail: user.demo_email });
});

// ── POST /api/auth/verify-otp ────────────────────────────────────────────────
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { email, otp } = req.body as { email: string; otp: string };

  if (!email || !otp) {
    res.status(400).json({ error: 'email and otp are required' });
    return;
  }

  const { rows: tokenRows } = await db.query(
    `SELECT * FROM otp_tokens
     WHERE LOWER(email) = LOWER($1) AND used = FALSE AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [email]
  );

  const token = tokenRows[0];
  if (!token || token.otp !== otp.trim()) {
    res.status(401).json({ error: 'Invalid or expired OTP.' });
    return;
  }

  await db.query('UPDATE otp_tokens SET used = TRUE WHERE id = $1', [token.id]);

  const { rows } = await db.query<UserRow>('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  const user = rows[0];
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const jwtPayload = { userId: user.id, email: user.email, role: user.role, loginType: user.login_type, name: user.name };
  const accessToken = jwt.sign(jwtPayload, process.env.JWT_SECRET ?? 'fallback_secret', { expiresIn: process.env.JWT_EXPIRES_IN ?? '8h' } as jwt.SignOptions);

  res.json({ token: accessToken, user: toUser(user) });
});

// ── POST /api/auth/debug-login — dev only, no OTP ───────────────────────────
router.post('/debug-login', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const { email } = req.body as { email: string };
  if (!email) { res.status(400).json({ error: 'email is required' }); return; }

  const { rows } = await db.query<UserRow>('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  const user = rows[0];
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const jwtPayload = { userId: user.id, email: user.email, role: user.role, loginType: user.login_type, name: user.name };
  const accessToken = jwt.sign(jwtPayload, process.env.JWT_SECRET ?? 'fallback_secret', { expiresIn: '8h' } as jwt.SignOptions);

  res.json({ token: accessToken, user: toUser(user) });
});

export default router;
