-- Migration: Rename owner column to subscription
-- Execute this in the PostgreSQL database if you have existing data

ALTER TABLE database_records RENAME COLUMN owner TO subscription;
