# Git Repository Setup Guide

This guide provides step-by-step instructions for uploading the Cloud DB Inventory application to a Git repository (GitHub, GitLab, Azure DevOps, etc.).

## Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [GitHub Setup](#github-setup)
- [GitLab Setup](#gitlab-setup)
- [Azure DevOps Setup](#azure-devops-setup)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before uploading to a Git repository, ensure you have:

1. **Git installed** on your machine
   ```powershell
   git --version
   ```
   If not installed, download from: https://git-scm.com/downloads

2. **Git configured** with your identity
   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Account created** on your chosen Git hosting platform:
   - GitHub: https://github.com
   - GitLab: https://gitlab.com
   - Azure DevOps: https://dev.azure.com

4. **SSH keys or Personal Access Token** configured (recommended for authentication)

---

## Initial Setup

### 1. Verify .gitignore

The repository already includes a `.gitignore` file. Verify it excludes sensitive files:

```powershell
cat .\.gitignore
```

Key exclusions:
- `.env` files (environment variables)
- `node_modules/` (Node dependencies)
- `__pycache__/` (Python cache)
- `.venv/` (Python virtual environment)
- `postgres_data/` (local database data)
- IDE-specific files (`.vscode/`, `.idea/`)

### 2. Initialize Git Repository (if not already done)

```powershell
# Navigate to project root
cd C:\Users\vare\Documents\gitrepos\cloud-db-inventory

# Initialize git (skip if already initialized)
git init

# Check status
git status
```

### 3. Create Initial Commit

```powershell
# Stage all files
git add .

# Verify what will be committed
git status

# Create initial commit
git commit -m "Initial commit: Cloud DB Inventory application

- FastAPI backend with PostgreSQL
- React frontend with Material-UI
- Docker Compose orchestration
- Features: Inventory management, CSV import/export, Dashboard, Upgrades tracking
- Duplicate detection and cleanup functionality"
```

---

## GitHub Setup

### Option 1: Using GitHub CLI (Recommended)

```powershell
# Install GitHub CLI if not already installed
# Download from: https://cli.github.com/

# Authenticate
gh auth login

# Create repository and push
gh repo create cloud-db-inventory --public --source=. --remote=origin --push
```

### Option 2: Using Git Commands

1. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Repository name: `cloud-db-inventory`
   - Description: "Cloud database inventory management system for AWS and Azure"
   - Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Connect local repository to GitHub**:
   ```powershell
   # Add remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/cloud-db-inventory.git
   
   # Or use SSH (if configured)
   git remote add origin git@github.com:YOUR_USERNAME/cloud-db-inventory.git
   
   # Verify remote
   git remote -v
   ```

3. **Push to GitHub**:
   ```powershell
   # Push main branch
   git branch -M main
   git push -u origin main
   ```

### 3. Add Repository Description and Topics

On GitHub repository page:
- Add description: "Cloud database inventory management for AWS and Azure with CSV import, dashboard analytics, and upgrade tracking"
- Add topics: `fastapi`, `react`, `postgresql`, `docker`, `cloud`, `aws`, `azure`, `database-management`, `inventory`, `material-ui`

---

## GitLab Setup

### 1. Create New Project on GitLab

- Go to https://gitlab.com/projects/new
- Click "Create blank project"
- Project name: `cloud-db-inventory`
- Project slug: `cloud-db-inventory`
- Visibility: Private or Public
- **Uncheck** "Initialize repository with a README"
- Click "Create project"

### 2. Push to GitLab

```powershell
# Add GitLab remote (replace YOUR_USERNAME)
git remote add origin https://gitlab.com/YOUR_USERNAME/cloud-db-inventory.git

# Or use SSH
git remote add origin git@gitlab.com:YOUR_USERNAME/cloud-db-inventory.git

# Push to GitLab
git branch -M main
git push -u origin main
```

---

## Azure DevOps Setup

### 1. Create New Repository in Azure DevOps

- Go to https://dev.azure.com
- Navigate to your project or create a new one
- Go to Repos → Files
- Click "Import" or create a new repository named `cloud-db-inventory`

### 2. Push to Azure DevOps

```powershell
# Add Azure DevOps remote (replace ORG and PROJECT)
git remote add origin https://dev.azure.com/ORG/PROJECT/_git/cloud-db-inventory

# Push to Azure DevOps
git branch -M main
git push -u origin main
```

### 3. Generate Personal Access Token (if needed)

- User Settings → Personal access tokens
- New Token → Select "Code (Read & Write)" scope
- Use token as password when prompted

---

## Best Practices

### 1. Branch Protection

Configure branch protection rules on your main branch:

**GitHub:**
- Settings → Branches → Add rule
- Branch name pattern: `main`
- Enable: "Require pull request reviews before merging"
- Enable: "Require status checks to pass before merging"

**GitLab:**
- Settings → Repository → Protected Branches
- Select `main` branch
- Set "Allowed to merge" and "Allowed to push"

### 2. Add Secrets and Environment Variables

**Never commit sensitive data!** Use repository secrets for:

- Database passwords
- API keys
- JWT secrets
- Cloud credentials

**GitHub Secrets:**
- Settings → Secrets and variables → Actions → New repository secret

**GitLab CI/CD Variables:**
- Settings → CI/CD → Variables → Add Variable

**Azure DevOps:**
- Pipelines → Library → Variable groups

### 3. Create Branches for Development

```powershell
# Create and switch to development branch
git checkout -b develop

# Create feature branch
git checkout -b feature/new-feature

# Push feature branch
git push -u origin feature/new-feature
```

### 4. Write Good Commit Messages

```powershell
# Format: <type>: <subject>
# 
# Types: feat, fix, docs, style, refactor, test, chore

git commit -m "feat: add duplicate cleanup endpoint"
git commit -m "fix: resolve CSV import validation error"
git commit -m "docs: update API documentation"
```

### 5. Use Tags for Releases

```powershell
# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tags
git push origin v1.0.0

# Or push all tags
git push --tags
```

---

## Recommended Repository Structure

Ensure your repository includes:

- ✅ `README.md` - Project overview and setup instructions
- ✅ `GIT_SETUP.md` - This file (git setup guide)
- ✅ `.gitignore` - Files to exclude from version control
- ✅ `docker-compose.yml` - Container orchestration
- ✅ `backend/requirements.txt` - Python dependencies
- ✅ `frontend/package.json` - Node dependencies
- ✅ `OPERATIONS.md` - Operational documentation
- ⚠️ `LICENSE` - Software license (add if needed)
- ⚠️ `CONTRIBUTING.md` - Contribution guidelines (add if team project)
- ⚠️ `.github/workflows/` or `.gitlab-ci.yml` - CI/CD pipelines (optional)

---

## Setting Up CI/CD (Optional)

### GitHub Actions Example

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest tests/

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Build
        run: |
          cd frontend
          npm run build
```

---

## Troubleshooting

### Issue: "fatal: remote origin already exists"

```powershell
# Remove existing remote and re-add
git remote remove origin
git remote add origin <your-repo-url>
```

### Issue: Authentication Failed

**For HTTPS:**
```powershell
# Use Personal Access Token instead of password
# GitHub: Settings → Developer settings → Personal access tokens
# Use token as password when prompted
```

**For SSH:**
```powershell
# Generate SSH key if not exists
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to ssh-agent
ssh-add ~/.ssh/id_ed25519

# Copy public key and add to GitHub/GitLab
cat ~/.ssh/id_ed25519.pub
# Add at: GitHub Settings → SSH and GPG keys → New SSH key
```

### Issue: Large files causing push failure

```powershell
# Check for large files
git ls-files | xargs ls -lh | sort -k5 -rh | head -20

# If you committed large files by mistake:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/large/file" \
  --prune-empty --tag-name-filter cat -- --all

# Or use BFG Repo-Cleaner (recommended)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
```

### Issue: Need to undo last commit

```powershell
# Undo last commit but keep changes
git reset --soft HEAD~1

# Undo last commit and discard changes
git reset --hard HEAD~1
```

### Issue: Forgot to add files to .gitignore

```powershell
# Remove from git but keep local file
git rm --cached <file>
git rm -r --cached <directory>

# Commit the removal
git commit -m "chore: remove tracked file that should be ignored"
```

---

## Quick Reference Commands

```powershell
# Check status
git status

# View changes
git diff

# View commit history
git log --oneline --graph --decorate --all

# Create branch
git checkout -b <branch-name>

# Switch branch
git checkout <branch-name>

# Merge branch
git merge <branch-name>

# Pull latest changes
git pull origin main

# Push changes
git push origin <branch-name>

# Stash changes
git stash
git stash pop

# View remotes
git remote -v

# Fetch all branches
git fetch --all

# Delete branch
git branch -d <branch-name>
git push origin --delete <branch-name>
```

---

## Additional Resources

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/
- **GitLab Documentation**: https://docs.gitlab.com/
- **Azure DevOps Git**: https://learn.microsoft.com/en-us/azure/devops/repos/git/
- **Pro Git Book** (free): https://git-scm.com/book/en/v2

---

## Next Steps After Pushing

1. ✅ Add repository description and topics
2. ✅ Enable branch protection rules
3. ✅ Set up CI/CD pipelines (optional)
4. ✅ Add collaborators (if team project)
5. ✅ Create issues for future enhancements
6. ✅ Set up project board for task tracking
7. ✅ Add badges to README (build status, coverage, etc.)
8. ✅ Configure repository insights and analytics

---

**Your repository is now ready for collaboration and continuous development!** 🚀
