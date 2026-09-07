-- Bus routes and tracking tables
CREATE TABLE bus_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_name TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  bus_number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 40,
  start_point TEXT NOT NULL,
  end_point TEXT NOT NULL,
  stops TEXT[] NOT NULL DEFAULT '{}',
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bus_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  speed DECIMAL(5,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_bus_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
  stop_name TEXT NOT NULL,
  pickup_time TIME NOT NULL,
  drop_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

CREATE INDEX idx_bus_tracking_route ON bus_tracking(route_id);
CREATE INDEX idx_student_bus_assignments_student ON student_bus_assignments(student_id);
