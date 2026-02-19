-- =============================================================
-- Database Initialization Script for URL Shortener
-- =============================================================
-- PostgreSQL tables: links, domains, domain_user
-- MongoDB collection (not created here): redirect_logs
-- =============================================================

-- Table: domains
-- Stores custom domains registered by users.
CREATE TABLE IF NOT EXISTS domains (
    id         SERIAL       PRIMARY KEY,
    host       TEXT         NOT NULL UNIQUE,
    owner_id   TEXT         NOT NULL,
    verified   BOOLEAN      NOT NULL DEFAULT FALSE
);

-- Table: domain_user
-- Junction table linking domains to authorized users.
CREATE TABLE IF NOT EXISTS domain_user (
    domain_id  TEXT         NOT NULL,
    user_id    TEXT         NOT NULL,
    email      TEXT
);

-- Table: links
-- Stores shortened URL mappings.
CREATE TABLE IF NOT EXISTS links (
    id           SERIAL       PRIMARY KEY,
    user_id      TEXT         NOT NULL,
    original_url TEXT         NOT NULL,
    tag          TEXT         NOT NULL,
    description  TEXT,
    base_url     TEXT         NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- MongoDB Collection Reference (create via application or shell)
-- =============================================================
-- Collection: redirect_logs
-- Fields:
--   linkId        : Number   — references links.id
--   tag           : String   — the short tag that was accessed
--   origin        : String   — the domain origin (base_url)
--   originalUrl   : String   — the target URL
--   at            : Date     — timestamp of the redirect
--   acceptLanguage: String   — Accept-Language header value
--   referer       : String   — HTTP Referer header value
--   ip            : String   — client IP address
--   headers       : Object   — sanitized HTTP headers
-- =============================================================
