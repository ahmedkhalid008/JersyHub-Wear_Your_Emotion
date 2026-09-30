-- Flyway Initial Baseline Migration for JerseyHub
-- Domain tables (users, products, categories, orders, payments, carts, etc.) will be added in subsequent phase migrations.

-- Baseline schema verification table
CREATE TABLE IF NOT EXISTS system_metadata (
    id VARCHAR(50) PRIMARY KEY,
    system_version VARCHAR(20) NOT NULL,
    initialized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_metadata (id, system_version)
VALUES ('JERSEYHUB_BASE', '1.0.0')
ON CONFLICT (id) DO NOTHING;
