# Deployment Guide

Complete guide for deploying Cloud DB Inventory to a new virtual machine or server environment.

## Table of Contents
- [Deployment Overview](#deployment-overview)
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Docker Deployment (Recommended)](#docker-deployment-recommended)
- [Manual Deployment](#manual-deployment)
- [Cloud Platform Deployments](#cloud-platform-deployments)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Security Hardening](#security-hardening)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Deployment Overview

Cloud DB Inventory can be deployed in several ways:

1. **Docker Compose** (Recommended) - Containerized deployment with all dependencies
2. **Manual Installation** - Direct installation on Linux/Windows servers
3. **Cloud Platforms** - AWS EC2, Azure VM, or other cloud providers

### Architecture

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Frontend (React + Vite)  :3000                 │
│         ↓ proxies /api                          │
│  Backend (FastAPI)        :8000                 │
│         ↓                                       │
│  PostgreSQL Database      :5432                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Prerequisites

### System Requirements

**Minimum:**
- 2 CPU cores
- 4 GB RAM
- 20 GB disk space
- Ubuntu 20.04+ / Windows Server 2019+ / RHEL 8+

**Recommended:**
- 4 CPU cores
- 8 GB RAM
- 50 GB disk space (SSD preferred)
- Ubuntu 22.04 LTS / Windows Server 2022

### Software Requirements

**For Docker Deployment:**
- Docker 20.10+
- Docker Compose 2.0+

**For Manual Deployment:**
- Python 3.12+
- Node.js 18+
- PostgreSQL 17+
- Git

### Network Requirements

**Required Ports:**
- `3000` - Frontend (can be changed)
- `8000` - Backend API (can be changed)
- `5432` - PostgreSQL (internal, can be changed)

**Firewall Rules:**
- Allow inbound on port 3000 (or your chosen frontend port)
- Allow inbound on port 8000 (or your chosen API port)
- PostgreSQL port should only be accessible internally

---

## Deployment Options

Choose the deployment method that best fits your environment.

---

## Docker Deployment (Recommended)

This is the easiest and most reliable deployment method.

### Step 1: Prepare the Server

**Ubuntu/Debian:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

**RHEL/CentOS:**
```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

**Windows Server:**
```powershell
# Install Docker Desktop for Windows Server
# Download from: https://docs.docker.com/desktop/install/windows-install/

# Or install Docker Engine:
Install-Module -Name DockerMsftProvider -Repository PSGallery -Force
Install-Package -Name docker -ProviderName DockerMsftProvider -Force
Restart-Computer
```

### Step 2: Clone Repository

```bash
# Clone from Git repository
git clone https://github.com/YOUR_USERNAME/cloud-db-inventory.git
cd cloud-db-inventory

# Or download and extract ZIP
wget https://github.com/YOUR_USERNAME/cloud-db-inventory/archive/main.zip
unzip main.zip
cd cloud-db-inventory-main
```

### Step 3: Configure Environment

```bash
# Create environment file (optional, uses defaults if not present)
cat > .env << EOF
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme_secure_password
POSTGRES_DB=inventory

# Backend
DATABASE_URL=postgresql://postgres:changeme_secure_password@postgres:5432/inventory

# Frontend (if needed)
VITE_API_URL=http://localhost:8000
EOF

# Set secure permissions
chmod 600 .env
```

### Step 4: Build and Start Services

```bash
# Build images
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### Step 5: Verify Deployment

```bash
# Check backend health
curl http://localhost:8000/health

# Should return: {"status":"ok"}

# Check frontend
curl http://localhost:3000

# Access in browser
# http://YOUR_SERVER_IP:3000
```

### Step 6: Initial Data Load (Optional)

```bash
# If you have CSV data to import, use the web interface:
# 1. Navigate to http://YOUR_SERVER_IP:3000
# 2. Click "Import CSV"
# 3. Upload your AWS or Azure database export
```

---

## Manual Deployment

For environments where Docker is not available or preferred.

### Step 1: Install Dependencies

**Ubuntu/Debian:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.12
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt install python3.12 python3.12-venv python3.12-dev -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install PostgreSQL 17
sudo apt install postgresql-17 postgresql-contrib-17 -y

# Install build tools
sudo apt install build-essential libpq-dev git -y

# Verify installations
python3.12 --version
node --version
psql --version
```

**Windows Server:**
```powershell
# Install Chocolatey package manager
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install dependencies
choco install python312 nodejs postgresql git -y

# Refresh environment
refreshenv
```

### Step 2: Set Up PostgreSQL

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE inventory;
CREATE USER clouddbuser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE inventory TO clouddbuser;
\q
EOF

# Configure PostgreSQL to accept connections (if needed)
sudo nano /etc/postgresql/17/main/postgresql.conf
# Set: listen_addresses = '*'

sudo nano /etc/postgresql/17/main/pg_hba.conf
# Add: host    inventory    clouddbuser    0.0.0.0/0    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Step 3: Deploy Backend

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/cloud-db-inventory.git
cd cloud-db-inventory/backend

# Create virtual environment
python3.12 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\Activate.ps1

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Configure environment
cat > .env << EOF
DATABASE_URL=postgresql://clouddbuser:your_secure_password@localhost:5432/inventory
EOF

# Test backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# For production, use systemd service (see below)
```

### Step 4: Deploy Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# The dist/ folder contains the production build

# Serve with a web server (nginx, Apache, or Node)
```

### Step 5: Set Up as System Services

**Backend Service (systemd - Linux):**

```bash
# Create service file
sudo nano /etc/systemd/system/clouddb-backend.service
```

```ini
[Unit]
Description=Cloud DB Inventory Backend
After=network.target postgresql.service

[Service]
Type=simple
User=YOUR_USER
WorkingDirectory=/path/to/cloud-db-inventory/backend
Environment="PATH=/path/to/cloud-db-inventory/backend/.venv/bin"
ExecStart=/path/to/cloud-db-inventory/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable clouddb-backend
sudo systemctl start clouddb-backend
sudo systemctl status clouddb-backend
```

**Frontend with Nginx:**

```bash
# Install Nginx
sudo apt install nginx -y

# Create site configuration
sudo nano /etc/nginx/sites-available/clouddb
```

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    root /path/to/cloud-db-inventory/frontend/dist;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/clouddb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Cloud Platform Deployments

### AWS EC2 Deployment

**Launch Instance:**
```bash
# Choose Ubuntu 22.04 LTS AMI
# Instance type: t3.medium or larger
# Security Group:
#   - Port 22 (SSH)
#   - Port 80 (HTTP)
#   - Port 443 (HTTPS)
#   - Port 3000 (Frontend) - optional, can use reverse proxy

# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Follow Docker deployment steps above
```

**Using RDS for PostgreSQL:**
```bash
# Instead of local PostgreSQL, use RDS:
# 1. Create RDS PostgreSQL instance
# 2. Update DATABASE_URL in .env:
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/inventory
```

### Azure VM Deployment

**Create VM:**
```bash
# Use Azure Portal or CLI
az vm create \
  --resource-group clouddb-rg \
  --name clouddb-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys

# Open ports
az vm open-port --port 80 --resource-group clouddb-rg --name clouddb-vm
az vm open-port --port 443 --resource-group clouddb-rg --name clouddb-vm
az vm open-port --port 3000 --resource-group clouddb-rg --name clouddb-vm

# Connect
ssh azureuser@your-vm-ip

# Follow Docker deployment steps above
```

**Using Azure Database for PostgreSQL:**
```bash
# Create Azure PostgreSQL flexible server
# Update DATABASE_URL:
DATABASE_URL=postgresql://username:password@your-postgres.postgres.database.azure.com:5432/inventory?sslmode=require
```

### Google Cloud Platform

```bash
# Create VM instance
gcloud compute instances create clouddb-vm \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud

# Configure firewall
gcloud compute firewall-rules create allow-clouddb \
  --allow tcp:80,tcp:443,tcp:3000

# Connect
gcloud compute ssh clouddb-vm

# Follow Docker deployment steps above
```

---

## Post-Deployment Configuration

### 1. Configure Reverse Proxy (Production)

**Nginx with SSL (Let's Encrypt):**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is set up automatically
sudo certbot renew --dry-run
```

**Updated Nginx config with SSL:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /path/to/cloud-db-inventory/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Set Up Backups

**Database Backup Script:**

```bash
#!/bin/bash
# /usr/local/bin/backup-clouddb.sh

BACKUP_DIR="/var/backups/clouddb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/clouddb_backup_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

# Docker deployment
docker exec cloud-db-inventory-postgres pg_dump -U postgres inventory | gzip > $BACKUP_FILE

# Manual deployment
# pg_dump -U clouddbuser -d inventory | gzip > $BACKUP_FILE

# Keep last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-clouddb.sh

# Schedule with cron (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-clouddb.sh
```

### 3. Configure Logging

**Docker Compose Logging:**

```yaml
# Add to docker-compose.yml services
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Application Logs:**

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Export logs
docker compose logs backend > backend.log
```

---

## Security Hardening

### 1. Firewall Configuration

**Ubuntu (ufw):**
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
sudo ufw status
```

### 2. Change Default Passwords

```bash
# Update PostgreSQL password
docker exec -it cloud-db-inventory-postgres psql -U postgres
# ALTER USER postgres WITH PASSWORD 'new_secure_password';

# Update .env file with new password
```

### 3. Enable Fail2Ban

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Regular Updates

```bash
# System updates
sudo apt update && sudo apt upgrade -y

# Docker images
docker compose pull
docker compose up -d
```

### 5. Database Security

```bash
# Restrict PostgreSQL access in docker-compose.yml
# Remove or comment out the ports section to prevent external access:
services:
  postgres:
    # ports:
    #   - "5432:5432"  # Remove this to make DB internal-only
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Frontend availability
curl -I http://localhost:3000

# Database connectivity
docker exec cloud-db-inventory-postgres pg_isready -U postgres
```

### Resource Monitoring

```bash
# Container resource usage
docker stats

# Disk usage
df -h
docker system df

# Clean up unused resources
docker system prune -a
```

### Log Rotation

```bash
# Configure logrotate for application logs
sudo nano /etc/logrotate.d/clouddb
```

```
/var/log/clouddb/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker compose logs backend

# Common issues:
# 1. Database connection - verify DATABASE_URL
# 2. Port conflict - check if port 8000 is in use
sudo lsof -i :8000

# 3. Permission issues
sudo chown -R $USER:$USER .
```

### Frontend Build Fails

```bash
# Check Node version
node --version  # Should be 18+

# Clear cache and rebuild
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check connection from backend container
docker exec cloud-db-inventory-backend ping postgres

# View PostgreSQL logs
docker compose logs postgres

# Connect manually to test
docker exec -it cloud-db-inventory-postgres psql -U postgres -d inventory
```

### High Memory Usage

```bash
# Limit container resources in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### SSL Certificate Issues

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

---

## Updating the Application

### Docker Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose build
docker compose up -d
```

### Manual Deployment

```bash
# Pull latest code
git pull origin main

# Update backend
cd backend
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart clouddb-backend

# Update frontend
cd ../frontend
npm install
npm run build
sudo systemctl restart nginx
```

---

## Performance Tuning

### PostgreSQL Optimization

```bash
# Edit PostgreSQL config
docker exec -it cloud-db-inventory-postgres bash
nano /var/lib/postgresql/data/postgresql.conf

# Recommended settings for 8GB RAM:
# shared_buffers = 2GB
# effective_cache_size = 6GB
# maintenance_work_mem = 512MB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# default_statistics_target = 100
# random_page_cost = 1.1
# effective_io_concurrency = 200
# work_mem = 10MB
# min_wal_size = 1GB
# max_wal_size = 4GB

# Restart PostgreSQL
docker compose restart postgres
```

### Nginx Optimization

```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

---

## Additional Resources

- **Project Repository**: https://github.com/YOUR_USERNAME/cloud-db-inventory
- **Docker Documentation**: https://docs.docker.com
- **PostgreSQL Documentation**: https://www.postgresql.org/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **React Documentation**: https://react.dev

---

## Support

For deployment issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review application logs
3. Open an issue on GitHub
4. Consult [OPERATIONS.md](OPERATIONS.md) for operational guidance

---

**Your Cloud DB Inventory application is now deployed and ready for use!** 🚀
