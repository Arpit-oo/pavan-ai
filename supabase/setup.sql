-- Pavan AI — Supabase Schema Setup
-- Run this in the SQL Editor: supabase.com/dashboard/project/wkotusufpcqykjcpxfdd/sql/new

CREATE TABLE IF NOT EXISTS stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT DEFAULT '',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    aqi INTEGER,
    pm25 DOUBLE PRECISION,
    pm10 DOUBLE PRECISION,
    no2 DOUBLE PRECISION,
    so2 DOUBLE PRECISION,
    co DOUBLE PRECISION,
    o3 DOUBLE PRECISION,
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    wind_speed DOUBLE PRECISION,
    wind_direction DOUBLE PRECISION,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id TEXT NOT NULL,
    forecast_time TIMESTAMPTZ NOT NULL,
    target_time TIMESTAMPTZ NOT NULL,
    predicted_aqi INTEGER,
    confidence_lower INTEGER,
    confidence_upper INTEGER,
    model_version TEXT DEFAULT 'xgboost_v1',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL,
    level TEXT,
    message_en TEXT,
    message_hi TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id TEXT,
    detected_at TIMESTAMPTZ NOT NULL,
    anomaly_type TEXT,
    severity TEXT,
    description TEXT,
    probable_cause TEXT,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_readings_station_time ON readings(station_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_readings_city ON readings(city);
CREATE INDEX IF NOT EXISTS idx_forecasts_station ON forecasts(station_id, target_time);
CREATE INDEX IF NOT EXISTS idx_anomalies_station ON anomalies(station_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active, city);

-- Enable RLS
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read stations" ON stations FOR SELECT TO anon USING (true);
CREATE POLICY "Public read readings" ON readings FOR SELECT TO anon USING (true);
CREATE POLICY "Public read forecasts" ON forecasts FOR SELECT TO anon USING (true);
CREATE POLICY "Public read alerts" ON alerts FOR SELECT TO anon USING (true);
CREATE POLICY "Public read anomalies" ON anomalies FOR SELECT TO anon USING (true);

-- Service role can insert (for backend)
CREATE POLICY "Service insert stations" ON stations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Service insert readings" ON readings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Service insert forecasts" ON forecasts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Service insert alerts" ON alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Service insert anomalies" ON anomalies FOR INSERT TO authenticated WITH CHECK (true);
