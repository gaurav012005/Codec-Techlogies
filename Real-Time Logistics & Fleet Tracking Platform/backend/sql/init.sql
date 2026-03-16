-- FleetTrack Pro Database Schema

-- Users table (Admin & Driver roles)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'driver' CHECK (role IN ('admin', 'driver')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_number VARCHAR(20) UNIQUE NOT NULL,
  driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'delayed', 'maintenance')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  pickup_location VARCHAR(255) NOT NULL,
  drop_location VARCHAR(255) NOT NULL,
  driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered')),
  scheduled_time TIMESTAMP,
  delivered_at TIMESTAMP,
  proof_image_url VARCHAR(500),
  signature_image_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracking logs table
CREATE TABLE IF NOT EXISTS tracking_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data: Admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
  ('Alex Morgan', 'admin@fleettrack.com', '$2a$10$YourHashedPasswordHere', 'admin')
ON CONFLICT (email) DO NOTHING;
