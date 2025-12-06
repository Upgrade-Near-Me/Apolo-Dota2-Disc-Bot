-- PostgreSQL initialization script for APOLO Dota 2 Bot
-- This script runs automatically on first container start
-- Creates necessary tables and indexes

-- ============================================
-- Security: Set strong passwords
-- ============================================

-- Create non-root user for bot (if not using default)
-- DO $$ BEGIN
--     CREATE ROLE apolo_bot WITH LOGIN PASSWORD 'STRONG_PASSWORD';
-- EXCEPTION WHEN DUPLICATE_OBJECT THEN
--     NULL;
-- END $$;

-- ============================================
-- Database Setup
-- ============================================

-- Ensure we're in the right database
SELECT 'Database ready for APOLO';

-- ============================================
-- Enable Extensions (if needed)
-- ============================================

-- For UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- For JSON operations
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Core Tables (from existing schema)
-- ============================================

-- These will be created by migration script
-- This file just ensures the database is ready
-- See: src/database/migrate.ts for full schema

GRANT ALL PRIVILEGES ON DATABASE apolo_dota2 TO apolo_bot;
