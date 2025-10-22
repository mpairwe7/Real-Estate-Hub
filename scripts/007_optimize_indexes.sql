-- Database Optimization: Performance Indexes
-- Week 3: Cloud Deployment & Monitoring
-- Run this in Supabase SQL Editor for better query performance

-- ============================================
-- PROPERTIES TABLE INDEXES
-- ============================================

-- Index for owner queries (dashboard, my properties)
CREATE INDEX IF NOT EXISTS idx_properties_owner_id 
ON properties(owner_id);

-- Index for property status filtering
CREATE INDEX IF NOT EXISTS idx_properties_status 
ON properties(status);

-- Index for sorting by creation date (newest first)
CREATE INDEX IF NOT EXISTS idx_properties_created_at 
ON properties(created_at DESC);

-- Composite index for owner + status queries
CREATE INDEX IF NOT EXISTS idx_properties_owner_status 
ON properties(owner_id, status);

-- Index for full-text search on title and description
CREATE INDEX IF NOT EXISTS idx_properties_search 
ON properties 
USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================
-- MAINTENANCE REQUESTS TABLE INDEXES
-- ============================================

-- Index for requester queries
CREATE INDEX IF NOT EXISTS idx_maintenance_requester_id 
ON maintenance_requests(requester_id);

-- Index for property-based queries
CREATE INDEX IF NOT EXISTS idx_maintenance_property_id 
ON maintenance_requests(property_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_maintenance_status 
ON maintenance_requests(status);

-- Index for priority filtering
CREATE INDEX IF NOT EXISTS idx_maintenance_priority 
ON maintenance_requests(priority);

-- Composite index for property + status queries
CREATE INDEX IF NOT EXISTS idx_maintenance_property_status 
ON maintenance_requests(property_id, status);

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_maintenance_created_at 
ON maintenance_requests(created_at DESC);

-- ============================================
-- TRANSACTIONS TABLE INDEXES
-- ============================================

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id 
ON transactions(user_id);

-- Index for property queries
CREATE INDEX IF NOT EXISTS idx_transactions_property_id 
ON transactions(property_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_transactions_status 
ON transactions(status);

-- Composite index for user + status queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_status 
ON transactions(user_id, status);

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_transactions_created_at 
ON transactions(created_at DESC);

-- ============================================
-- PROPERTY IMAGES TABLE INDEXES
-- ============================================

-- Index for property-based image queries
CREATE INDEX IF NOT EXISTS idx_property_images_property_id 
ON property_images(property_id);

-- Index for sorting by display order
CREATE INDEX IF NOT EXISTS idx_property_images_order 
ON property_images(property_id, display_order);

-- ============================================
-- PROFILES TABLE INDEXES
-- ============================================

-- Index for email lookups (if not already primary key)
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON profiles(role);

-- ============================================
-- VERIFY INDEXES
-- ============================================

-- Query to list all indexes on key tables
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    schemaname = 'public'
    AND tablename IN ('properties', 'maintenance_requests', 'transactions', 'property_images', 'profiles')
ORDER BY 
    tablename, indexname;

-- ============================================
-- PERFORMANCE MONITORING
-- ============================================

-- Query to find slow queries (run after some usage)
SELECT
    calls,
    total_exec_time::numeric(10,2) as total_time_ms,
    mean_exec_time::numeric(10,2) as avg_time_ms,
    query
FROM
    pg_stat_statements
WHERE
    query NOT LIKE '%pg_stat_statements%'
    AND query NOT LIKE '%pg_indexes%'
ORDER BY
    total_exec_time DESC
LIMIT 10;

-- ============================================
-- MAINTENANCE NOTES
-- ============================================

-- To rebuild indexes if needed (rarely required):
-- REINDEX TABLE properties;
-- REINDEX TABLE maintenance_requests;
-- REINDEX TABLE transactions;

-- To analyze table statistics for query planner:
-- ANALYZE properties;
-- ANALYZE maintenance_requests;
-- ANALYZE transactions;

-- Check index usage statistics:
-- SELECT
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan as index_scans,
--     idx_tup_read as tuples_read,
--     idx_tup_fetch as tuples_fetched
-- FROM
--     pg_stat_user_indexes
-- WHERE
--     schemaname = 'public'
-- ORDER BY
--     idx_scan DESC;
