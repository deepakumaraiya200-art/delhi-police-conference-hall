-- Delhi Police Conference Hall Booking System — Database Schema

CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(50)  PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  department    VARCHAR(150),
  role          VARCHAR(30)  NOT NULL,
  login_type    VARCHAR(20)  NOT NULL,
  demo_email    VARCHAR(150),
  assigned_rooms TEXT[],
  avatar        VARCHAR(500),
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id             VARCHAR(50)  PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  room_number    VARCHAR(20),
  tower          VARCHAR(50),
  floor          VARCHAR(50),
  capacity_min   INTEGER,
  capacity_max   INTEGER,
  status         VARCHAR(30)  NOT NULL DEFAULT 'available',
  managed_by     VARCHAR(100),
  caretaker_id   VARCHAR(50),
  type           VARCHAR(50),
  amenities      TEXT[],
  img_src        VARCHAR(500),
  image          VARCHAR(255),
  description    TEXT,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id                VARCHAR(50)  PRIMARY KEY,
  room_id           VARCHAR(50)  REFERENCES rooms(id),
  user_id           VARCHAR(50)  REFERENCES users(id),
  title             VARCHAR(200) NOT NULL,
  description       TEXT,
  organizer         VARCHAR(100),
  participants_count INTEGER,
  date              DATE         NOT NULL,
  start_time        VARCHAR(10)  NOT NULL,
  end_time          VARCHAR(10)  NOT NULL,
  status            VARCHAR(30)  NOT NULL DEFAULT 'confirmed',
  cancel_reason     TEXT,
  overridden_by     VARCHAR(50),
  mom               TEXT,
  created_at        TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id        VARCHAR(50)  PRIMARY KEY,
  user_id   VARCHAR(50)  REFERENCES users(id) ON DELETE CASCADE,
  type      VARCHAR(50),
  message   TEXT         NOT NULL,
  read      BOOLEAN      NOT NULL DEFAULT FALSE,
  timestamp TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_tokens (
  id         SERIAL       PRIMARY KEY,
  email      VARCHAR(150) NOT NULL,
  otp        VARCHAR(10)  NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  used       BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_room_date   ON bookings(room_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_user        ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_email            ON otp_tokens(email);
