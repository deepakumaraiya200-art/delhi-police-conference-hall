import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter          from './routes/auth.js';
import usersRouter         from './routes/users.js';
import roomsRouter         from './routes/rooms.js';
import bookingsRouter      from './routes/bookings.js';
import notificationsRouter from './routes/notifications.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth',          authRouter);
app.use('/api/users',         usersRouter);
app.use('/api/rooms',         roomsRouter);
app.use('/api/bookings',      bookingsRouter);
app.use('/api/notifications', notificationsRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

export default app;
