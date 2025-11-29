-- Leger v0.1.0 Initial Database Schema
-- This migration creates all tables including v0.2.0+ tables (unused in v0.1.0)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_uuid TEXT PRIMARY KEY,
    tailscale_user_id TEXT NOT NULL UNIQUE,
    tailscale_email TEXT NOT NULL,
    tailnet TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_device_id TEXT,
    cli_version TEXT,
    total_authentications INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_users_tailscale_id ON users(tailscale_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(tailscale_email);
CREATE INDEX IF NOT EXISTS idx_users_tailnet ON users(tailnet);

-- Releases table (v0.1.0: GitHub URLs only)
CREATE TABLE IF NOT EXISTS releases (
    id TEXT PRIMARY KEY,
    user_uuid TEXT NOT NULL,
    name TEXT NOT NULL,
    git_url TEXT NOT NULL,
    git_branch TEXT NOT NULL DEFAULT 'main',
    description TEXT,
    version INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_uuid) REFERENCES users(user_uuid) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_release_user_name ON releases(user_uuid, name);
CREATE INDEX IF NOT EXISTS idx_release_user ON releases(user_uuid);
CREATE INDEX IF NOT EXISTS idx_release_version ON releases(version);

-- Configurations table (v0.2.0+: rendered templates)
-- Created but unused in v0.1.0
CREATE TABLE IF NOT EXISTS configurations (
    id TEXT PRIMARY KEY,
    user_uuid TEXT NOT NULL,
    release_id TEXT,
    config_data JSON NOT NULL,
    schema_version TEXT NOT NULL,
    version INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_uuid) REFERENCES users(user_uuid) ON DELETE CASCADE,
    FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_config_user ON configurations(user_uuid);
CREATE INDEX IF NOT EXISTS idx_config_release ON configurations(release_id);

-- Deployments table (v0.2.0+: deployment tracking)
-- Created but unused in v0.1.0
CREATE TABLE IF NOT EXISTS deployments (
    id TEXT PRIMARY KEY,
    release_id TEXT NOT NULL,
    user_uuid TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('rendering', 'uploading', 'ready', 'deployed', 'failed')),
    r2_path TEXT,
    manifest_url TEXT,
    error_message TEXT,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE,
    FOREIGN KEY (user_uuid) REFERENCES users(user_uuid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_deployment_release ON deployments(release_id);
CREATE INDEX IF NOT EXISTS idx_deployment_user ON deployments(user_uuid);
CREATE INDEX IF NOT EXISTS idx_deployment_status ON deployments(status);

-- Audit log table (future use)
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_uuid TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    metadata JSON,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_uuid) REFERENCES users(user_uuid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_uuid);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
