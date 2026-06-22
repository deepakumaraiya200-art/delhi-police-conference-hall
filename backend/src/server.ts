import app from './app.js';
import { db } from './db/client.js';

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  await db.query('SELECT 1'); // verify DB connection
  console.log('[DB] Connected to PostgreSQL');

  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
