/**
 * Type definitions for Leger v0.1.0
 * Mirrors backend API models exactly
 */

/**
 * User public profile (safe to return to clients)
 * From api/models/user.ts
 */
export interface UserProfile {
  user_uuid: string;
  email: string;
  display_name: string | null;
  tailnet: string;
  created_at: string;
}

/**
 * Secret metadata (without plaintext value)
 * From api/models/secret.ts
 */
export interface SecretMetadata {
  name: string;
  created_at: string;
  updated_at: string;
  version: number;
}

/**
 * Secret with plaintext value (for CLI sync)
 * From api/models/secret.ts
 */
export interface SecretWithValue {
  name: string;
  value: string; // Decrypted plaintext
  version: number;
  created_at: string;
}

/**
 * Release record stored in D1
 * From api/models/release.ts
 */
export interface ReleaseRecord {
  id: string; // UUID v4
  user_uuid: string; // Owner
  name: string; // User-chosen name (e.g., "my-openwebui")
  git_url: string; // GitHub/GitLab URL
  git_branch: string; // Branch to clone (default: "main")
  description: string | null; // Optional description
  version: number; // Auto-increment per user (1, 2, 3...)
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // Last modification time
}

/**
 * Release creation input
 * From api/models/release.ts
 */
export interface CreateReleaseInput {
  name: string;
  git_url: string;
  git_branch?: string; // Defaults to "main"
  description?: string;
}

/**
 * Release update input
 * From api/models/release.ts
 */
export interface UpdateReleaseInput {
  name?: string;
  git_url?: string;
  git_branch?: string;
  description?: string;
}

/**
 * API response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    action?: string;
    docs?: string;
  };
}

/**
 * Session type for atomic JWT storage
 */
export interface Session {
  jwt: string;
  user: UserProfile;
  expiresAt: string;
}

/**
 * Auth validation response
 */
export interface AuthResponse {
  user: UserProfile;
  token: string;
}

/**
 * Secrets list response
 */
export interface SecretsListResponse {
  secrets: SecretWithValue[];
}

/**
 * Releases list response
 */
export interface ReleasesListResponse {
  releases: ReleaseRecord[];
}

/**
 * Configuration data (v0.2.0+)
 * Placeholder for future configuration form support
 */
export interface ConfigData {
  [key: string]: string;
}

/**
 * App mode (legacy - for future form/raw editor toggle)
 */
export type AppMode = 'form' | 'raw';

/**
 * Validation error (legacy - for form validation)
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Import result (legacy - for file import functionality)
 */
export interface ImportResult {
  success: boolean;
  data?: ConfigData;
  errors?: ValidationError[];
}

/**
 * Environment variable (legacy - for .env editor)
 */
export interface EnvVariable {
  key: string;
  value: string;
  comment?: string;
}

/**
 * Storage configuration (legacy)
 */
export interface StorageConfig {
  key: string;
  value: ConfigData | string;
  timestamp: number;
  version: string;
}

/**
 * Storage history (legacy)
 */
export interface StorageHistory {
  configs: StorageConfig[];
  maxSize: number;
}

/**
 * Auto-save options (legacy)
 */
export interface AutoSaveOptions {
  debounce?: number;
  debounceMs?: number;
  enabled?: boolean;
  maxHistorySize?: number;
}
