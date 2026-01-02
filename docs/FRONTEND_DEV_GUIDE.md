# Frontend Development Guide

## Preventing Stale Compiled Files

This project uses TypeScript. To avoid issues with stale compiled JavaScript files:

### Important Rules:
1. **Never commit compiled `.js` files from the `src/` directory** - they belong in `dist/` only
2. **Before building Docker images**, ensure no `.js` files exist in `src/`:
   ```powershell
   Get-ChildItem -Path frontend/src -Filter *.js -Recurse | Remove-Item -Force
   ```
3. **Always rebuild with --no-cache after major TypeScript changes**:
   ```bash
   docker-compose build --no-cache frontend
   ```

### Development Workflow:

**For local development (hot reload):**
```bash
cd frontend
npm run dev
```

**For Docker deployment:**
```bash
# Step 1: Clean any compiled files in src
Get-ChildItem -Path frontend/src -Filter *.js -Recurse | Remove-Item -Force

# Step 2: Rebuild Docker image
docker-compose build --no-cache frontend

# Step 3: Restart container
docker-compose up -d frontend
```

### Files That Prevent This Issue:
- `.gitignore` - Prevents committing compiled files
- `frontend/.dockerignore` - Prevents Docker from copying compiled files
- This guide - Reminds developers of the correct workflow

### If You See Stale UI After Code Changes:
1. Delete compiled JS files: `Get-ChildItem -Path frontend/src -Filter *.js -Recurse | Remove-Item -Force`
2. Rebuild: `docker-compose build --no-cache frontend`
3. Restart: `docker-compose up -d frontend`
4. Clear browser cache: `Ctrl + Shift + R`
