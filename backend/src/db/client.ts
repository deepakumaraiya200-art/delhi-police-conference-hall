import { Pool, types } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Return DATE columns as plain 'YYYY-MM-DD' strings instead of JS Date objects,
// which would be interpreted at midnight LOCAL time and shift by timezone offset.
types.setTypeParser(1082, (val) => val);

export const db = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host:     process.env.DB_HOST     ?? 'localhost',
        port:     Number(process.env.DB_PORT ?? 5432),
        database: process.env.DB_NAME     ?? 'delhi_police_halls',
        user:     process.env.DB_USER     ?? 'postgres',
        password: process.env.DB_PASSWORD ?? '',
      }
);
