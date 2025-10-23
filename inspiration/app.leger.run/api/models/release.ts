/**
 * Release data models
 * For release tracking in D1 (v0.1.0: GitHub URLs only)
 */

/**
 * Release record stored in D1
 */
export interface ReleaseRecord {
  id: string // UUID v4
  user_uuid: string // Owner
  name: string // User-chosen name (e.g., "my-openwebui")
  git_url: string // GitHub/GitLab URL
  git_branch: string // Branch to clone (default: "main")
  description: string | null // Optional description
  version: number // Auto-increment per user (1, 2, 3...)
  created_at: string // ISO 8601 timestamp
  updated_at: string // Last modification time
}

/**
 * Release creation input
 */
export interface CreateReleaseInput {
  name: string
  git_url: string
  git_branch?: string // Defaults to "main"
  description?: string
}

/**
 * Release update input
 */
export interface UpdateReleaseInput {
  name?: string
  git_url?: string
  git_branch?: string
  description?: string
}

/**
 * Validate release name
 * Rules: alphanumeric, underscore, hyphen only; 1-64 characters
 */
export function isValidReleaseName(name: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(name)
}

/**
 * Validate Git URL
 * Accepts: https://github.com/..., https://gitlab.com/..., etc.
 */
export function isValidGitURL(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      (parsed.hostname.includes('github.com') ||
        parsed.hostname.includes('gitlab.com') ||
        parsed.hostname.includes('gitea.') ||
        parsed.hostname.includes('bitbucket.org') ||
        // Allow custom git servers
        parsed.pathname.endsWith('.git') ||
        parsed.pathname.includes('.git/'))
    )
  } catch {
    return false
  }
}

/**
 * Validate Git branch name
 */
export function isValidBranchName(branch: string): boolean {
  return /^[a-zA-Z0-9_/-]{1,255}$/.test(branch)
}
