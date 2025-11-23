# Branch Management for Claude Code

This guide explains how to work with branches when using Claude Code to implement features.

## 🎯 Understanding Claude Code's Branch Behavior

### Default Behavior

**Claude Code works with the default branch** (usually `main` or `master`) unless you specify otherwise. This means:

- If you don't specify a branch, Claude Code will use `main`
- Files that only exist on feature branches won't be accessible
- Changes made by Claude Code will be made to the default branch

### Current Situation

Your PRDs and feature folders are currently:
- ✅ Created on branch: `fix/api-pagination-and-data-structure`
- ❌ Not on `main` branch
- ❌ Not committed to git yet (untracked files)

## 🔧 How to Specify a Branch for Claude Code

### Option 1: Specify Branch in Prompt (Recommended)

Add branch information to your Claude Code prompt:

```
Work on branch: fix/api-pagination-and-data-structure

[Your implementation prompt here]
```

Or more explicitly:

```
Branch: fix/api-pagination-and-data-structure

Implement the R2 Storage Service feature following the PRD at 
wip-webapp/PRD_SETUP_REAL_R2_STORAGE.md...
```

### Option 2: Merge to Main First (Best Practice)

Before using Claude Code, merge your PRDs to main:

```bash
# 1. Commit your PRDs and feature folders
git add PRD_*.md claude/
git commit -m "docs: add PRDs and Claude Code feature folders"

# 2. Switch to main
git checkout main

# 3. Merge your branch
git merge fix/api-pagination-and-data-structure

# 4. Push to remote
git push origin main
```

Then Claude Code will have access to the PRDs on `main`.

### Option 3: Create Feature Branch from Main

Create a new feature branch from main with the PRDs:

```bash
# 1. Commit current changes
git add PRD_*.md claude/
git commit -m "docs: add PRDs and Claude Code feature folders"

# 2. Switch to main
git checkout main

# 3. Create new feature branch
git checkout -b feature/setup-real-r2-storage

# 4. Cherry-pick or merge the PRD commit
git cherry-pick <commit-hash>
# OR merge the branch
git merge fix/api-pagination-and-data-structure

# 5. Push new branch
git push origin feature/setup-real-r2-storage
```

## 📋 Recommended Workflow

### Step 1: Commit PRDs to Current Branch

```bash
cd wip-webapp
git add PRD_*.md claude/ SERVICES_STATUS_REPORT.md
git commit -m "docs: add service integration PRDs and Claude Code setup"
```

### Step 2: Merge to Main (or Create PR)

**Option A: Direct Merge (if you have permissions)**
```bash
git checkout main
git merge fix/api-pagination-and-data-structure
git push origin main
```

**Option B: Create Pull Request (Recommended)**
```bash
# Push current branch
git push origin fix/api-pagination-and-data-structure

# Then create PR on GitHub:
# Base: main
# Compare: fix/api-pagination-and-data-structure
# Title: "docs: add service integration PRDs and Claude Code setup"
```

### Step 3: Use Claude Code on Main

Once PRDs are on `main`, Claude Code will automatically use them:

```
Implement the R2 Storage Service feature following the PRD at 
wip-webapp/PRD_SETUP_REAL_R2_STORAGE.md...
```

### Step 4: Create Feature Branch for Implementation

Have Claude Code create a feature branch for each implementation:

```
Create a new branch: feature/setup-real-r2-storage

Then implement the R2 Storage Service feature following the PRD at 
wip-webapp/PRD_SETUP_REAL_R2_STORAGE.md...
```

## 🎯 Best Practices

### 1. Keep PRDs on Main

- PRDs should be on `main` so Claude Code can always access them
- Feature implementations can be on feature branches

### 2. Specify Branch in Prompt

Always include branch information in your Claude Code prompt:

```
Branch: feature/setup-real-r2-storage
Base: main (PRDs are here)

Implement the R2 Storage Service feature...
```

### 3. One Feature Per Branch

- Each feature implementation should have its own branch
- Branch name should match the PRD's target branch

### 4. Verify Branch Before Starting

Add this to your prompt:

```
Before starting, verify you're working on branch: feature/setup-real-r2-storage
If not, create and switch to this branch first.
```

## 🔍 How to Check What Branch Claude Code Will Use

### In Your Prompt, Ask Claude Code:

```
What branch are you currently working on? 
Please verify the PRD files exist at:
- wip-webapp/PRD_SETUP_REAL_R2_STORAGE.md
- wip-webapp/claude/CLAUDE_CODE_ENVIRONMENT_SETUP.md

If they don't exist, switch to branch: fix/api-pagination-and-data-structure
```

### Check Branch in Claude Code Interface

Claude Code's web interface may show:
- Current branch selector (if available)
- Repository path with branch indicator
- File tree showing which branch's files are visible

## 📝 Complete Example Prompt with Branch Management

```
Branch: feature/setup-real-r2-storage
Base Branch: main (PRDs are here)

Before starting:
1. Verify you're on branch: feature/setup-real-r2-storage
2. If not, create and switch to this branch: git checkout -b feature/setup-real-r2-storage
3. Verify PRD exists: wip-webapp/PRD_SETUP_REAL_R2_STORAGE.md
4. If PRD doesn't exist, check branch: fix/api-pagination-and-data-structure

Then implement the R2 Storage Service feature following the PRD at 
wip-webapp/PRD_SETUP_REAL_R2_STORAGE.md...

[Rest of implementation prompt]
```

## 🚨 Troubleshooting

### Problem: Claude Code can't find PRD files

**Solution:**
1. Check which branch has the PRDs: `git branch --contains <commit-hash>`
2. Specify that branch in your prompt
3. Or merge PRDs to main first

### Problem: Claude Code works on wrong branch

**Solution:**
1. Explicitly specify branch in prompt: `Branch: feature-name`
2. Ask Claude Code to verify: "What branch are you working on?"
3. Have Claude Code switch: "Switch to branch: feature-name"

### Problem: Changes made to wrong branch

**Solution:**
1. Check what branch Claude Code modified
2. Create a new branch from the correct base
3. Cherry-pick or merge changes to correct branch

## ✅ Quick Checklist

Before using Claude Code:

- [ ] PRDs are committed to git
- [ ] PRDs are on `main` branch (or you know which branch has them)
- [ ] You specify the branch in your Claude Code prompt
- [ ] Feature branch exists (or Claude Code will create it)
- [ ] You've verified Claude Code can access the PRD files

---

**Last Updated:** 2025-01-22

