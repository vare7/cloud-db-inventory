# Contributing to Cloud DB Inventory

Thank you for your interest in contributing to the Cloud DB Inventory project! This document provides guidelines and instructions for contributing.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### 1. Fork and Clone

```powershell
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/cloud-db-inventory.git
cd cloud-db-inventory

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/cloud-db-inventory.git
```

### 2. Set Up Development Environment

```powershell
# Backend setup
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

# Start services
cd ..
docker-compose up -d
```

### 3. Create a Branch

```powershell
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

---

## Development Workflow

### Branch Naming Conventions

- `feature/` - New features (e.g., `feature/add-export-functionality`)
- `fix/` - Bug fixes (e.g., `fix/csv-import-validation`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/optimize-queries`)
- `test/` - Adding or updating tests (e.g., `test/add-api-tests`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Making Changes

1. **Make your changes** in the appropriate files
2. **Test thoroughly** - ensure all tests pass
3. **Update documentation** if needed
4. **Add tests** for new functionality

### Running Tests

**Backend:**
```powershell
cd backend
pytest tests/ -v
pytest tests/ --cov=app --cov-report=html
```

**Frontend:**
```powershell
cd frontend
npm test
npm run lint
npm run build
```

**Integration:**
```powershell
docker-compose up -d
# Run integration tests or manual verification
docker-compose down
```

---

## Coding Standards

### Python (Backend)

**Style Guide:** Follow PEP 8

```python
# Good
def calculate_storage_total(databases: List[DatabaseRecord]) -> int:
    """Calculate total storage across all databases.
    
    Args:
        databases: List of database records
        
    Returns:
        Total storage in GB
    """
    return sum(db.storage_gb for db in databases)

# Use type hints
# Use docstrings for functions and classes
# Keep functions focused and small
# Use meaningful variable names
```

**Tools:**
```powershell
# Format with black
pip install black
black backend/app

# Lint with flake8
pip install flake8
flake8 backend/app

# Type check with mypy
pip install mypy
mypy backend/app
```

### TypeScript/React (Frontend)

**Style Guide:** Follow Airbnb JavaScript/React Style Guide

```typescript
// Good
interface Database {
  id: string;
  service: string;
  provider: DatabaseProvider;
  region: string;
}

const DatabaseCard: React.FC<{ database: Database }> = ({ database }) => {
  return (
    <Card>
      <Typography variant="h6">{database.service}</Typography>
      <Typography>{database.provider}</Typography>
    </Card>
  );
};

// Use TypeScript interfaces
// Use functional components with hooks
// Keep components small and focused
// Use meaningful prop names
```

**Tools:**
```powershell
# Lint with ESLint
npm run lint

# Format with Prettier (if configured)
npm run format

# Type check
npm run type-check
```

### General Guidelines

- **Keep it simple** - Prefer clarity over cleverness
- **DRY principle** - Don't Repeat Yourself
- **SOLID principles** - Especially Single Responsibility
- **Error handling** - Always handle errors gracefully
- **Security** - Never commit secrets or sensitive data
- **Performance** - Consider performance implications
- **Accessibility** - Ensure UI is accessible (WCAG 2.1 AA)

---

## Commit Guidelines

### Commit Message Format

Use the conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

**Examples:**

```powershell
git commit -m "feat(api): add duplicate detection endpoint"

git commit -m "fix(csv): resolve import validation for Azure exports"

git commit -m "docs(readme): update installation instructions"

git commit -m "refactor(store): optimize database query performance"
```

**Good Commit Message:**
```
feat(upgrades): add version threshold filtering

- Implement backend logic to parse version strings
- Add major version dropdown in frontend
- Keep latest version when resolving duplicates
- Add comprehensive tests for version parsing

Closes #42
```

### Commit Best Practices

- Make atomic commits (one logical change per commit)
- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused and small

---

## Pull Request Process

### Before Submitting

- ✅ Code follows style guidelines
- ✅ All tests pass
- ✅ New tests added for new functionality
- ✅ Documentation updated
- ✅ No merge conflicts with main branch
- ✅ Commit messages follow conventions

### Submitting a Pull Request

1. **Push your branch**
   ```powershell
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request on GitHub**
   - Go to your fork on GitHub
   - Click "Compare & pull request"
   - Fill out the PR template

3. **PR Title Format**
   ```
   feat(scope): Brief description of changes
   ```

4. **PR Description Template**
   ```markdown
   ## Description
   Brief description of what this PR does.

   ## Type of Change
   - [ ] Bug fix (non-breaking change which fixes an issue)
   - [ ] New feature (non-breaking change which adds functionality)
   - [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
   - [ ] Documentation update

   ## Changes Made
   - Added X functionality
   - Fixed Y bug
   - Updated Z documentation

   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manually tested in local environment

   ## Screenshots (if applicable)
   [Add screenshots here]

   ## Related Issues
   Closes #123
   Related to #456

   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-reviewed my own code
   - [ ] Commented code in hard-to-understand areas
   - [ ] Updated documentation
   - [ ] No new warnings generated
   - [ ] Added tests that prove fix/feature works
   - [ ] New and existing tests pass locally
   ```

### Review Process

1. **Automated checks** will run (CI/CD)
2. **Maintainers will review** your code
3. **Address feedback** by pushing new commits
4. **Approval and merge** by maintainer

### After Merge

```powershell
# Update your local main branch
git checkout main
git pull upstream main

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## Reporting Bugs

### Before Submitting a Bug Report

- Check existing issues to avoid duplicates
- Verify it's actually a bug and not a feature request
- Test with the latest version
- Collect relevant information

### Bug Report Template

```markdown
**Bug Description**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Backend Version: [e.g., 1.0.0]
- Frontend Version: [e.g., 1.0.0]

**Additional Context**
Any other relevant information.

**Logs**
```
Paste relevant logs here
```
```

---

## Suggesting Enhancements

### Enhancement Proposal Template

```markdown
**Feature Description**
A clear description of the enhancement.

**Problem It Solves**
Explain the problem this feature would solve.

**Proposed Solution**
Describe your proposed solution.

**Alternative Solutions**
Describe alternatives you've considered.

**Additional Context**
Any other relevant information.

**Implementation Notes**
- Estimated complexity: [Low/Medium/High]
- Breaking change: [Yes/No]
- Requires database migration: [Yes/No]
```

---

## Development Tips

### Useful Commands

```powershell
# Backend - Run specific test
pytest backend/tests/test_api.py::test_function_name -v

# Backend - Watch for changes
uvicorn app.main:app --reload

# Frontend - Development with hot reload
npm run dev

# Docker - View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Docker - Rebuild single service
docker-compose build backend
docker-compose up -d backend

# Database - Connect to PostgreSQL
docker exec -it cloud-db-inventory-postgres psql -U postgres -d inventory
```

### Debugging

**Backend:**
```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or use debugpy for VS Code
import debugpy
debugpy.listen(5678)
debugpy.wait_for_client()
```

**Frontend:**
```typescript
// Use browser DevTools
console.log('Debug:', variable);
debugger; // Breakpoint
```

### Database Migrations

If you make model changes:

```python
# After changing models.py
# Restart backend to apply changes
docker-compose restart backend

# For production, consider using Alembic for migrations
```

---

## Communication

### Channels

- **Issues**: For bugs and feature requests
- **Pull Requests**: For code contributions
- **Discussions**: For general questions and ideas

### Getting Help

- Review existing documentation
- Search closed issues
- Ask in discussions
- Be specific and provide context

---

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes for significant contributions
- Project README acknowledgments

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Cloud DB Inventory! 🚀
