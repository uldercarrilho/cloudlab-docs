# Database Design Standards

## 📋 Document Information

- **Document Name**: Database Design Standards
- **Version**: 1.0
- **Date**: 2025-09-04
- **Author**: AI Agent (TASK-025)
- **Status**: Approved
- **Related Documents**: 
  - [ADR-004: Data Storage & Consistency Patterns](../../architecture/decisions/ADR-004-data-storage-consistency-patterns.md)
  - [Business Rules](../../product/PRD-001-business-rules.md)
  - [Go Coding Standards](coding-standards-golang.md)

---

## 🎯 Purpose & Scope

### Purpose
Establish comprehensive database design standards for the CloudLab distributed e-commerce platform, ensuring consistent, scalable, and maintainable data architecture across all services.

### Scope
This document covers:
- Database schema design patterns for distributed systems
- Migration strategies and versioning
- Data consistency models and implementation
- Partitioning and sharding strategies
- Performance optimization guidelines
- Multi-tenant database design patterns
- Data archiving and retention policies

---

## 🏗️ Database Architecture Overview

### Technology Stack
Based on [ADR-004: Data Storage & Consistency Patterns](../../architecture/decisions/ADR-004-data-storage-consistency-patterns.md):

- **Primary Database**: PostgreSQL 15+ for transactional data
- **Caching Layer**: Redis 7+ for high-performance caching
- **Analytics Database**: ClickHouse 23+ for analytical workloads
- **Event Store**: PostgreSQL with event sourcing pattern

### Data Domain Mapping
- **Transactional Data (PostgreSQL)**: Orders, payments, user accounts, inventory
- **Cache Data (Redis)**: Session management, product catalog cache, API responses
- **Analytics Data (ClickHouse)**: Business intelligence, user behavior, performance metrics
- **Event Data (PostgreSQL)**: Audit trails, data lineage, CQRS read models

---

## 📊 Schema Design Principles

### 1. Naming Conventions

#### Table Naming
```sql
-- Use snake_case for table names
-- Use descriptive, self-documenting names
-- Include domain prefix for multi-tenant tables

-- Good examples:
users
user_profiles
order_items
product_catalog
vendor_commissions

-- Multi-tenant examples:
tenant_products
tenant_orders
tenant_analytics
```

#### Column Naming
```sql
-- Use snake_case for column names
-- Be descriptive and consistent
-- Use standard suffixes for common patterns

-- Good examples:
user_id
created_at
updated_at
is_active
email_address
phone_number
order_status
payment_method
```

#### Index Naming
```sql
-- Use descriptive names with table and column references
-- Include index type when relevant

-- Good examples:
idx_users_email
idx_orders_user_id_created_at
idx_products_vendor_id_status
idx_payments_order_id_status
```

### 2. Data Types and Constraints

#### Standard Data Types
```sql
-- Use appropriate PostgreSQL data types
-- Always specify precision for numeric types
-- Use ENUM types for fixed value sets

-- Examples:
CREATE TYPE order_status AS ENUM ('draft', 'pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer', 'cryptocurrency');
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin', 'support');

-- Use appropriate numeric types
price DECIMAL(10,2) NOT NULL,  -- For monetary values
quantity INTEGER NOT NULL,     -- For counts
weight DECIMAL(8,3),           -- For measurements
rating DECIMAL(3,2),           -- For ratings (0.00-5.00)
```

#### Column Constraints
```sql
-- Always use appropriate constraints
-- Include comprehensive comments

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone_format CHECK (phone_number IS NULL OR phone_number ~* '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT chk_age_restriction CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '13 years')
);

-- Add comprehensive comments
COMMENT ON TABLE users IS 'User accounts for customers, vendors, and administrators';
COMMENT ON COLUMN users.user_id IS 'Unique identifier for the user account';
COMMENT ON COLUMN users.email IS 'User email address, must be unique and valid format';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password, never store plain text';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active and can log in';
COMMENT ON COLUMN users.email_verified IS 'Whether the user has verified their email address';
```

### 3. Primary Keys and Foreign Keys

#### Primary Key Standards
```sql
-- Use UUID for distributed systems
-- Include created_at for temporal queries
-- Use composite keys only when necessary

-- Good example:
CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status order_status NOT NULL DEFAULT 'draft',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for foreign keys
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

#### Foreign Key Standards
```sql
-- Always specify ON DELETE behavior
-- Use RESTRICT for critical relationships
-- Use CASCADE for dependent data
-- Use SET NULL for optional relationships

-- Examples:
-- Critical relationship - prevent deletion
user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,

-- Dependent data - cascade deletion
order_item_id UUID NOT NULL REFERENCES order_items(order_item_id) ON DELETE CASCADE,

-- Optional relationship - set to null
parent_category_id UUID REFERENCES categories(category_id) ON DELETE SET NULL,
```

---

## 🔄 Data Consistency Patterns

### 1. Consistency Models by Domain

#### Strong Consistency (CP from CAP)
```sql
-- Use for critical business data
-- Orders, payments, inventory reservations

-- Example: Order processing with strong consistency
BEGIN;
    -- Reserve inventory
    UPDATE products 
    SET available_quantity = available_quantity - $1 
    WHERE product_id = $2 AND available_quantity >= $1;
    
    -- Create order
    INSERT INTO orders (user_id, total_amount, status) 
    VALUES ($3, $4, 'pending_payment');
    
    -- Create order items
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES ($5, $2, $1, $6);
COMMIT;
```

#### Eventual Consistency (AP from CAP)
```sql
-- Use for product catalog, user preferences, analytics
-- Accept temporary inconsistencies for availability

-- Example: Product catalog updates
-- 1. Update primary database
UPDATE products SET price = $1, updated_at = NOW() WHERE product_id = $2;

-- 2. Publish event for eventual consistency
INSERT INTO events (event_type, aggregate_id, event_data, created_at)
VALUES ('product_price_updated', $2, jsonb_build_object('price', $1), NOW());

-- 3. Event handlers update read replicas and caches
-- This happens asynchronously, ensuring availability
```

### 2. Event Sourcing Implementation

#### Event Store Schema
```sql
-- Event store for audit trails and CQRS
CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_version INTEGER NOT NULL,
    event_data JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_event_version_positive CHECK (event_version > 0)
);

-- Indexes for event sourcing queries
CREATE INDEX idx_events_aggregate_id ON events(aggregate_id);
CREATE INDEX idx_events_aggregate_type ON events(aggregate_type);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_event_type ON events(event_type);

-- Comments
COMMENT ON TABLE events IS 'Event store for event sourcing and audit trails';
COMMENT ON COLUMN events.aggregate_id IS 'ID of the aggregate root this event belongs to';
COMMENT ON COLUMN events.aggregate_type IS 'Type of aggregate (Order, User, Product, etc.)';
COMMENT ON COLUMN events.event_type IS 'Type of event (OrderCreated, PaymentProcessed, etc.)';
COMMENT ON COLUMN events.event_data IS 'JSON data containing the event payload';
```

#### Event Examples
```sql
-- Order created event
INSERT INTO events (aggregate_id, aggregate_type, event_type, event_version, event_data)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Order',
    'OrderCreated',
    1,
    jsonb_build_object(
        'order_id', '550e8400-e29b-41d4-a716-446655440000',
        'user_id', '550e8400-e29b-41d4-a716-446655440001',
        'total_amount', 99.99,
        'items', jsonb_build_array(
            jsonb_build_object('product_id', '550e8400-e29b-41d4-a716-446655440002', 'quantity', 2, 'price', 49.99)
        )
    )
);

-- Payment processed event
INSERT INTO events (aggregate_id, aggregate_type, event_type, event_version, event_data)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Order',
    'PaymentProcessed',
    2,
    jsonb_build_object(
        'payment_id', '550e8400-e29b-41d4-a716-446655440003',
        'amount', 99.99,
        'payment_method', 'credit_card',
        'transaction_id', 'txn_123456789'
    )
);
```

### 3. Saga Pattern Implementation

#### Saga State Management
```sql
-- Saga state tracking
CREATE TABLE saga_instances (
    saga_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saga_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'started',
    current_step INTEGER NOT NULL DEFAULT 0,
    saga_data JSONB NOT NULL,
    compensation_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_saga_status CHECK (status IN ('started', 'completed', 'compensating', 'failed')),
    CONSTRAINT chk_current_step_positive CHECK (current_step >= 0)
);

-- Saga step tracking
CREATE TABLE saga_steps (
    step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saga_id UUID NOT NULL REFERENCES saga_instances(saga_id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    
    -- Constraints
    CONSTRAINT chk_step_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'compensated')),
    CONSTRAINT chk_retry_count_positive CHECK (retry_count >= 0)
);

-- Indexes
CREATE INDEX idx_saga_instances_type_status ON saga_instances(saga_type, status);
CREATE INDEX idx_saga_steps_saga_id ON saga_steps(saga_id);
CREATE INDEX idx_saga_steps_status ON saga_steps(status);
```

---

## 🏢 Multi-Tenant Database Design

### 1. Tenant Isolation Strategies

#### Row-Level Security (RLS)
```sql
-- Enable RLS on tenant-specific tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policy
CREATE POLICY tenant_isolation_policy ON products
    FOR ALL TO application_role
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Set tenant context in application
SET app.current_tenant_id = '550e8400-e29b-41d4-a716-446655440000';
```

#### Tenant-Specific Schemas
```sql
-- Create tenant-specific schemas
CREATE SCHEMA tenant_001;
CREATE SCHEMA tenant_002;

-- Create tables in tenant schemas
CREATE TABLE tenant_001.products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_002.products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### 2. Tenant Data Management

#### Tenant Configuration
```sql
-- Tenant configuration table
CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_name VARCHAR(255) NOT NULL UNIQUE,
    schema_name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Tenant-specific settings
    settings JSONB NOT NULL DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT chk_schema_name_format CHECK (schema_name ~* '^[a-z][a-z0-9_]*$')
);

-- Comments
COMMENT ON TABLE tenants IS 'Configuration for multi-tenant database setup';
COMMENT ON COLUMN tenants.schema_name IS 'Database schema name for this tenant';
COMMENT ON COLUMN tenants.settings IS 'Tenant-specific configuration settings';
```

---

## 📈 Performance Optimization

### 1. Indexing Strategies

#### Primary Indexes
```sql
-- Always index foreign keys
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Index frequently queried columns
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_vendor_id ON products(vendor_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_orders_user_status_created ON orders(user_id, status, created_at);
CREATE INDEX idx_products_vendor_status ON products(vendor_id, status);
CREATE INDEX idx_events_aggregate_type_created ON events(aggregate_type, created_at);
```

#### Partial Indexes
```sql
-- Index only active records
CREATE INDEX idx_users_active ON users(user_id) WHERE is_active = true;
CREATE INDEX idx_products_active ON products(product_id) WHERE status = 'active';

-- Index specific status values
CREATE INDEX idx_orders_pending ON orders(order_id) WHERE status = 'pending_payment';
CREATE INDEX idx_orders_shipped ON orders(order_id) WHERE status = 'shipped';
```

#### Covering Indexes
```sql
-- Include frequently accessed columns in index
CREATE INDEX idx_orders_user_covering ON orders(user_id) 
INCLUDE (order_id, status, total_amount, created_at);

-- This allows queries to be satisfied entirely from the index
-- without accessing the table data
```

### 2. Query Optimization

#### Query Patterns
```sql
-- Use appropriate WHERE clauses
-- Good: Uses index on user_id
SELECT * FROM orders WHERE user_id = $1 AND status = 'shipped';

-- Good: Uses composite index
SELECT * FROM orders WHERE user_id = $1 AND status = 'shipped' ORDER BY created_at DESC;

-- Avoid: Full table scan
SELECT * FROM orders WHERE total_amount > 100;

-- Better: Add index and use range query
CREATE INDEX idx_orders_total_amount ON orders(total_amount);
SELECT * FROM orders WHERE total_amount > 100 ORDER BY total_amount;
```

#### Pagination
```sql
-- Use cursor-based pagination for large datasets
-- Good: Cursor-based pagination
SELECT * FROM orders 
WHERE user_id = $1 
  AND created_at < $2  -- cursor from previous page
ORDER BY created_at DESC 
LIMIT 20;

-- Avoid: OFFSET for large datasets
SELECT * FROM orders 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 1000;  -- Can be slow for large offsets
```

### 3. Connection Pooling

#### PgBouncer Configuration
```ini
# pgbouncer.ini
[databases]
cloudlab = host=localhost port=5432 dbname=cloudlab user=cloudlab password=development

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = 100
max_user_connections = 50
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
logfile = /var/log/pgbouncer/pgbouncer.log
pidfile = /var/run/pgbouncer/pgbouncer.pid
```

---

## 🔄 Migration Strategies

### 1. Versioned Migrations

#### Migration File Structure
```sql
-- migrations/001_create_users_table.sql
-- Migration: Create users table
-- Author: AI Agent
-- Date: 2025-09-04
-- Description: Initial users table with authentication fields

BEGIN;

-- Create users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone_format CHECK (phone_number IS NULL OR phone_number ~* '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT chk_age_restriction CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '13 years')
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(user_id) WHERE is_active = true;

-- Add comments
COMMENT ON TABLE users IS 'User accounts for customers, vendors, and administrators';
COMMENT ON COLUMN users.user_id IS 'Unique identifier for the user account';
COMMENT ON COLUMN users.email IS 'User email address, must be unique and valid format';

COMMIT;
```

#### Migration Tracking
```sql
-- Migration tracking table
CREATE TABLE schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    checksum VARCHAR(64) NOT NULL,
    description TEXT
);

-- Comments
COMMENT ON TABLE schema_migrations IS 'Tracks applied database migrations';
COMMENT ON COLUMN schema_migrations.version IS 'Migration version identifier';
COMMENT ON COLUMN schema_migrations.checksum IS 'SHA256 checksum of migration file';
```

### 2. Zero-Downtime Migrations

#### Adding Columns
```sql
-- Step 1: Add nullable column
ALTER TABLE users ADD COLUMN middle_name VARCHAR(100);

-- Step 2: Populate column with default values
UPDATE users SET middle_name = '' WHERE middle_name IS NULL;

-- Step 3: Make column NOT NULL (if needed)
ALTER TABLE users ALTER COLUMN middle_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN middle_name SET DEFAULT '';
```

#### Adding Indexes
```sql
-- Use CONCURRENTLY for large tables
CREATE INDEX CONCURRENTLY idx_users_middle_name ON users(middle_name);

-- This prevents blocking reads and writes during index creation
```

#### Schema Changes
```sql
-- Step 1: Create new table structure
CREATE TABLE users_new (LIKE users INCLUDING ALL);

-- Step 2: Copy data
INSERT INTO users_new SELECT * FROM users;

-- Step 3: Rename tables (atomic operation)
BEGIN;
    ALTER TABLE users RENAME TO users_old;
    ALTER TABLE users_new RENAME TO users;
COMMIT;

-- Step 4: Drop old table (after verification)
DROP TABLE users_old;
```

---

## 📊 Data Partitioning and Sharding

### 1. Horizontal Partitioning

#### Time-Based Partitioning
```sql
-- Create partitioned table for events
CREATE TABLE events (
    event_id UUID NOT NULL,
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE events_2025_01 PARTITION OF events
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE events_2025_02 PARTITION OF events
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Create indexes on partitions
CREATE INDEX idx_events_2025_01_aggregate_id ON events_2025_01(aggregate_id);
CREATE INDEX idx_events_2025_02_aggregate_id ON events_2025_02(aggregate_id);
```

#### Hash-Based Partitioning
```sql
-- Create partitioned table for users
CREATE TABLE users (
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
) PARTITION BY HASH (user_id);

-- Create hash partitions
CREATE TABLE users_0 PARTITION OF users FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE users_1 PARTITION OF users FOR VALUES WITH (modulus 4, remainder 1);
CREATE TABLE users_2 PARTITION OF users FOR VALUES WITH (modulus 4, remainder 2);
CREATE TABLE users_3 PARTITION OF users FOR VALUES WITH (modulus 4, remainder 3);
```

### 2. Sharding Strategies

#### Tenant-Based Sharding
```sql
-- Shard by tenant_id
-- Each tenant gets its own database or schema

-- Shard 1: tenants 1-1000
CREATE DATABASE shard_001;
\c shard_001;
CREATE SCHEMA tenant_001;
CREATE SCHEMA tenant_002;
-- ... more tenant schemas

-- Shard 2: tenants 1001-2000
CREATE DATABASE shard_002;
\c shard_002;
CREATE SCHEMA tenant_1001;
CREATE SCHEMA tenant_1002;
-- ... more tenant schemas
```

#### Geographic Sharding
```sql
-- Shard by geographic region
-- US East: us-east-1 database
-- US West: us-west-1 database
-- Europe: eu-west-1 database

-- Each region has its own database with local data
CREATE DATABASE us_east_001;
CREATE DATABASE us_west_001;
CREATE DATABASE eu_west_001;
```

---

## 🗄️ Data Archiving and Retention

### 1. Retention Policies

#### Business Rule Compliance
```sql
-- Based on business rules from PRD-001
-- Order data: 7 years retention
-- Analytics data: 2 years retention
-- Log data: 1 year retention

-- Create retention policy function
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS void AS $$
BEGIN
    -- Archive orders older than 7 years
    INSERT INTO orders_archive 
    SELECT * FROM orders 
    WHERE created_at < NOW() - INTERVAL '7 years';
    
    DELETE FROM orders 
    WHERE created_at < NOW() - INTERVAL '7 years';
    
    -- Archive analytics data older than 2 years
    INSERT INTO analytics_archive 
    SELECT * FROM analytics_events 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    DELETE FROM analytics_events 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Archive log data older than 1 year
    INSERT INTO logs_archive 
    SELECT * FROM application_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    DELETE FROM application_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;
```

#### Automated Archiving
```sql
-- Create archive tables
CREATE TABLE orders_archive (LIKE orders INCLUDING ALL);
CREATE TABLE analytics_archive (LIKE analytics_events INCLUDING ALL);
CREATE TABLE logs_archive (LIKE application_logs INCLUDING ALL);

-- Schedule archiving job
-- This would be set up in your job scheduler (cron, etc.)
-- 0 2 * * * psql -d cloudlab -c "SELECT archive_old_data();"
```

### 2. Data Lifecycle Management

#### Soft Deletion
```sql
-- Use soft deletion for important data
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for soft deletion queries
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;

-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete_user(user_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE user_id = user_uuid AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔒 Security and Compliance

### 1. Data Encryption

#### Encryption at Rest
```sql
-- Use PostgreSQL's built-in encryption
-- Configure in postgresql.conf
-- ssl = on
-- ssl_cert_file = 'server.crt'
-- ssl_key_file = 'server.key'

-- For sensitive data, use application-level encryption
-- Store encrypted values in database
CREATE TABLE user_payment_methods (
    payment_method_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    encrypted_card_number TEXT NOT NULL,  -- Encrypted at application level
    card_last_four VARCHAR(4) NOT NULL,   -- For display purposes
    card_type VARCHAR(50) NOT NULL,
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### Encryption in Transit
```sql
-- Always use SSL/TLS for database connections
-- Configure connection strings with SSL
-- postgresql://user:password@host:port/database?sslmode=require

-- Use connection pooling with SSL
-- Configure PgBouncer with SSL
```

### 2. Access Control

#### Role-Based Access
```sql
-- Create application roles
CREATE ROLE application_readonly;
CREATE ROLE application_readwrite;
CREATE ROLE application_admin;

-- Grant appropriate permissions
GRANT CONNECT ON DATABASE cloudlab TO application_readonly;
GRANT USAGE ON SCHEMA public TO application_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO application_readonly;

GRANT CONNECT ON DATABASE cloudlab TO application_readwrite;
GRANT USAGE ON SCHEMA public TO application_readwrite;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO application_readwrite;

GRANT ALL PRIVILEGES ON DATABASE cloudlab TO application_admin;
```

#### Row-Level Security
```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for data access
CREATE POLICY user_data_policy ON users
    FOR ALL TO application_readwrite
    USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY order_data_policy ON orders
    FOR ALL TO application_readwrite
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

---

## 📊 Monitoring and Observability

### 1. Database Metrics

#### Performance Monitoring
```sql
-- Create monitoring views
CREATE VIEW database_performance_metrics AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats
WHERE schemaname = 'public';

-- Query performance monitoring
CREATE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 1000  -- Queries taking more than 1 second
ORDER BY mean_time DESC;
```

#### Health Checks
```sql
-- Database health check function
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    message TEXT
) AS $$
BEGIN
    -- Check database connectivity
    RETURN QUERY SELECT 'connectivity'::TEXT, 'OK'::TEXT, 'Database is accessible'::TEXT;
    
    -- Check for long-running queries
    IF EXISTS (
        SELECT 1 FROM pg_stat_activity 
        WHERE state = 'active' 
        AND query_start < NOW() - INTERVAL '5 minutes'
    ) THEN
        RETURN QUERY SELECT 'long_queries'::TEXT, 'WARNING'::TEXT, 'Long-running queries detected'::TEXT;
    ELSE
        RETURN QUERY SELECT 'long_queries'::TEXT, 'OK'::TEXT, 'No long-running queries'::TEXT;
    END IF;
    
    -- Check for locks
    IF EXISTS (
        SELECT 1 FROM pg_locks 
        WHERE NOT granted
    ) THEN
        RETURN QUERY SELECT 'locks'::TEXT, 'WARNING'::TEXT, 'Blocking locks detected'::TEXT;
    ELSE
        RETURN QUERY SELECT 'locks'::TEXT, 'OK'::TEXT, 'No blocking locks'::TEXT;
    END IF;
    
    -- Check disk space (simplified)
    RETURN QUERY SELECT 'disk_space'::TEXT, 'OK'::TEXT, 'Disk space check passed'::TEXT;
END;
$$ LANGUAGE plpgsql;
```

### 2. Business Metrics

#### Business Rule Compliance Monitoring
```sql
-- Monitor business rule compliance
CREATE VIEW business_rule_compliance AS
SELECT 
    'order_processing_time' AS rule_name,
    COUNT(*) AS total_orders,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) AS avg_processing_seconds,
    CASE 
        WHEN AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) < 3600 THEN 'COMPLIANT'
        ELSE 'NON_COMPLIANT'
    END AS compliance_status
FROM orders 
WHERE status = 'shipped' 
  AND created_at >= NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
    'inventory_update_propagation' AS rule_name,
    COUNT(*) AS total_updates,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) AS avg_propagation_seconds,
    CASE 
        WHEN AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) < 60 THEN 'COMPLIANT'
        ELSE 'NON_COMPLIANT'
    END AS compliance_status
FROM inventory_updates 
WHERE created_at >= NOW() - INTERVAL '1 hour';
```

---

## 📚 Best Practices Summary

### 1. Design Principles
- **Consistency First**: Choose appropriate consistency model for each data domain
- **Performance by Design**: Index strategically, partition when needed
- **Security by Default**: Encrypt sensitive data, use least privilege access
- **Observability Built-in**: Monitor performance and business metrics
- **Testing Comprehensive**: Test business rules, performance, and integration

### 2. Implementation Guidelines
- **Use UUIDs**: For distributed systems primary keys
- **Add Comments**: Document all tables and columns
- **Index Foreign Keys**: Always index foreign key columns
- **Use Constraints**: Enforce data integrity at database level
- **Plan Migrations**: Use versioned, reversible migrations

### 3. Operational Excellence
- **Monitor Performance**: Track query performance and resource usage
- **Archive Old Data**: Implement retention policies per business rules
- **Backup Regularly**: Automated backups with point-in-time recovery
- **Test Recovery**: Regular disaster recovery testing
- **Document Everything**: Keep documentation current and comprehensive

---

## 🔗 Related Documents

### **Core Development Standards**
- [Comprehensive Coding Standards](coding-standards.md) - Database integration patterns
- [Go Coding Standards](coding-standards-golang.md) - Go database implementation patterns
- [Testing Guidelines](testing-guidelines.md) - Database testing strategies
- [Code Review Guidelines](code-review-guidelines.md) - Database review criteria
- [Error Handling Patterns](error-handling-patterns.md) - Database error handling

### **API & Communication Standards**
- [API Design Principles](../../api/guides/api-design-principles.md) - Database API patterns
- [Authorization Guidelines](../../api/guides/authorization.md) - Database security patterns
- [JWT Implementation](../../api/guides/jwt-implementation.md) - Database authentication
- [OAuth 2.0 Setup](../../api/guides/oauth-setup.md) - Database OAuth integration
- [Rate Limiting](../../api/guides/rate-limiting.md) - Database performance protection

### **Infrastructure & Operations**
- [Deployment Guidelines](deployment-guidelines.md) - Database deployment strategies
- [Service Mesh Configuration](service-mesh-configuration-standards.md) - Database service mesh
- [Monitoring & Observability](monitoring-observability-standards.md) - Database monitoring
- [Performance Standards](performance-standards.md) - Database performance optimization

### **Data & Event Management**
- [Event Sourcing Guidelines](event-sourcing-guidelines.md) - Event store patterns
- [Security Best Practices](security-best-practices.md) - Database security
- [Mocking Strategy](mocking-strategy.md) - Database mocking for testing

### **Architecture Documents**
- [ADR-004: Data Storage & Consistency Patterns](../../architecture/decisions/ADR-004-data-storage-consistency-patterns.md)
- [ADR-003: Container Orchestration & Service Mesh](../../architecture/decisions/ADR-003-container-orchestration-service-mesh.md)
- [System Overview](../../architecture/overview/system-overview.md)
- [Distributed Patterns](../../architecture/patterns/distributed-patterns.md)

### **Business Documents**
- [Business Rules](../../product/PRD-001-business-rules.md)
- [Development Plan](../../product/PRD-002-development-plan.md)

---

**Document Created**: 2025-09-04
**Last Updated**: 2025-09-04  
**Status**: Approved
