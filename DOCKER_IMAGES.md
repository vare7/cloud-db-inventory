# Cloud Database Inventory - Docker Images

This directory contains everything needed to deploy the Cloud Database Inventory application using Docker containers.

## 🚀 Quick Start (5 minutes)

### Linux/macOS

```bash
chmod +x deploy.sh
./deploy.sh
```

### Windows PowerShell

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy.ps1
```

Then open your browser to: **http://localhost:3000**

---

## 📦 Pre-Built Docker Images

Both Docker images are already built and ready to use:

### Backend Image
- **Name:** `cloud-db-inventory-backend:latest`
- **Size:** 556 MB
- **Base:** Python 3.12-slim
- **Services:** FastAPI, Uvicorn, SQLAlchemy ORM
- **Port:** 8000 (API)

### Frontend Image
- **Name:** `cloud-db-inventory-frontend:latest`
- **Size:** 48.8 MB
- **Base:** Nginx 1.27-alpine
- **Services:** React UI, Nginx proxy
- **Port:** 80 (exposed as 3000)

---

## 📋 What Gets Deployed

```
cloud-db-inventory/
├── Docker Images (pre-built)
│   ├── Backend (556 MB)
│   ├── Frontend (48.8 MB)
│   └── PostgreSQL 17 (from Docker Hub)
│
├── Docker Compose Orchestration
│   ├── Multi-container setup
│   ├── Service networking
│   ├── Volume management
│   └── Health checks
│
├── Configuration
│   ├── .env (environment variables)
│   ├── docker-compose.yml (service definitions)
│   └── frontend/nginx.conf (reverse proxy)
│
└── Access Points
    ├── Frontend UI: http://localhost:3000
    ├── Backend API: http://localhost:8000
    └── API Docs: http://localhost:8000/docs
```

---

## 🛠️ Deployment Options

### Option 1: Using Docker Compose (Recommended)

**Best for:** Local development, quick deployments, testing

```bash
# Start services
docker-compose up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Using Kubernetes

**Best for:** Production, scaling, high availability

See `DOCKER_DEPLOYMENT.md` for Kubernetes manifests.

### Option 3: Using Docker Swarm

**Best for:** Multi-node deployments

```bash
docker swarm init
docker stack deploy -c docker-compose.yml cloud-db-inventory
```

---

## 🔧 Configuration

### Environment Variables

Create or edit `.env` file:

```env
# Database
POSTGRES_PASSWORD=your-secure-password
POSTGRES_USER=postgres
POSTGRES_DB=cloud_db_inventory

# Backend
DATABASE_URL=postgresql://postgres:your-secure-password@postgres:5432/cloud_db_inventory
```

### Port Configuration

Edit `docker-compose.yml` to change ports:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change from 3000 to 8080

  backend:
    ports:
      - "8001:8000"  # Change from 8000 to 8001
```

---

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 1 core | 2+ cores |
| RAM | 2 GB | 4+ GB |
| Disk | 2 GB | 10+ GB |
| Docker | 20.10+ | Latest |
| Docker Compose | 1.29+ | Latest |

---

## 🔐 Security Considerations

### Development
- Default password in `.env` is for development only
- No SSL/TLS by default
- Database exposed on localhost

### Production
- ✅ Change `POSTGRES_PASSWORD` to a strong, random password
- ✅ Use environment-specific `.env` files
- ✅ Enable SSL/TLS with reverse proxy (Nginx, Traefik)
- ✅ Restrict database network access
- ✅ Use secrets management (Docker Secrets, Vault)
- ✅ Enable Docker security scanning
- ✅ Set resource limits on containers
- ✅ Use read-only file systems where possible

Example production `.env`:

```env
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_USER=cloud_db_admin
POSTGRES_DB=cloud_db_inventory
DATABASE_URL=postgresql://cloud_db_admin:$(POSTGRES_PASSWORD)@postgres:5432/cloud_db_inventory
```

---

## 🎯 Common Tasks

### View Application Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Access Database

```bash
# Interactive psql session
docker-compose exec postgres psql -U postgres -d cloud_db_inventory

# Execute SQL query
docker-compose exec postgres psql -U postgres -d cloud_db_inventory -c "SELECT * FROM database_records LIMIT 5;"
```

### Backup Database

```bash
# Full database backup
docker-compose exec postgres pg_dumpall -U postgres > backup.sql

# Compressed backup
docker-compose exec postgres pg_dumpall -U postgres | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore Database

```bash
# From plain SQL backup
docker exec -i cloud-db-inventory-postgres psql -U postgres < backup.sql

# From compressed backup
gunzip < backup.sql.gz | docker exec -i cloud-db-inventory-postgres psql -U postgres
```

### Restart Services

```bash
# Graceful restart
docker-compose restart

# Restart specific service
docker-compose restart backend

# Force recreate (hard restart)
docker-compose up -d --force-recreate backend
```

### Update Images

```bash
# Rebuild from source
docker-compose build

# Pull latest pre-built images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

---

## 🚨 Troubleshooting

### "Connection refused" error

```bash
# Check if services are running
docker-compose ps

# Check logs for errors
docker-compose logs backend
docker-compose logs postgres

# Restart services
docker-compose restart
```

### "Port already in use" error

```bash
# Find process using the port
# Linux/macOS:
lsof -i :3000

# Windows:
netstat -ano | findstr :3000

# Either:
# 1. Change port in docker-compose.yml
# 2. Kill the process: kill -9 <PID>
# 3. Stop conflicting docker containers: docker-compose down
```

### "Database connection failed" error

```bash
# Check database is healthy
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify environment variables
docker-compose config | grep -A 5 postgres

# Test connection manually
docker-compose exec postgres psql -U postgres -c "SELECT 1"
```

### "Frontend shows blank page"

```bash
# Check frontend logs
docker-compose logs frontend

# Verify backend is accessible
curl http://localhost:8000/api/stats

# Check browser console for JavaScript errors
# Open: http://localhost:3000 and check Developer Tools (F12)
```

---

## 📈 Performance Tuning

### Database Optimization

```yaml
postgres:
  environment:
    POSTGRES_INITDB_ARGS: "-c max_connections=200 -c shared_buffers=256MB"
```

### Resource Limits

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
```

### Connection Pooling

Backend already uses SQLAlchemy with connection pooling:
- Pool size: 20
- Max overflow: 40
- Echo: False (disable in production)

---

## 🔄 CI/CD Integration

### Build Images in CI/CD

```bash
# Build and tag
docker build -t cloud-db-inventory-backend:v1.0.0 -f backend/Dockerfile .
docker build -t cloud-db-inventory-frontend:v1.0.0 -f frontend/Dockerfile .

# Push to registry
docker push registry.example.com/cloud-db-inventory-backend:v1.0.0
docker push registry.example.com/cloud-db-inventory-frontend:v1.0.0
```

### Deploy from CI/CD

```bash
# Pull latest
docker-compose pull

# Deploy
docker-compose up -d

# Health check
curl -f http://localhost:8000/api/stats || exit 1
```

---

## 📚 Additional Resources

- **Docker Documentation:** https://docs.docker.com/
- **Docker Compose Reference:** https://docs.docker.com/compose/compose-file/
- **PostgreSQL in Docker:** https://hub.docker.com/_/postgres
- **FastAPI Documentation:** https://fastapi.tiangolo.com/
- **React Documentation:** https://react.dev/

---

## 📝 Support

For issues or questions:

1. Check the logs: `docker-compose logs -f`
2. Review `DOCKER_DEPLOYMENT.md` for detailed guidance
3. Verify all services are running: `docker-compose ps`
4. Check system resources: `docker stats`
5. Review application documentation in the main repository

---

## 📄 License

See LICENSE file in the main repository.

---

**Last Updated:** December 5, 2025
**Version:** 1.0.0
