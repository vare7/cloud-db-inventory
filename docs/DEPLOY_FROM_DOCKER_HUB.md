# Deploying Cloud DB Inventory from Docker Hub (Private Images)

These steps let you pull the prebuilt frontend, backend, and Postgres images from the private Docker Hub repo and run them together with Docker Compose.

## Prerequisites
- Docker Engine installed (20.10+ recommended)
- Docker Compose plugin (`docker compose` command)
- Network egress to Docker Hub
- Docker Hub credentials with access to the private repo

### Installing Docker + Compose (quick refs)
- **Ubuntu/Debian**
  ```bash
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo usermod -aG docker $USER  # re-login or run: newgrp docker
  docker --version
  docker compose version
  ```
- **RHEL/CentOS/Rocky**
  ```bash
  sudo yum install -y yum-utils
  sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
  sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo systemctl enable --now docker
  sudo usermod -aG docker $USER  # re-login or run: newgrp docker
  docker --version
  docker compose version
  ```
- **Windows/macOS**: Install Docker Desktop (includes Compose v2): https://docs.docker.com/desktop/
  - Verify after install: `docker --version` and `docker compose version`

## 1) Authenticate to Docker Hub
```bash
docker login
```

## 2) Create `docker-compose.deploy.yml`
Use the shared repo `avrahul/cloud-db-inventory` with distinct tags per service:
```yaml
services:
  postgres:
    image: avrahul/cloud-db-inventory:postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres   # change for non-dev
      POSTGRES_DB: cloud_db_inventory
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    image: avrahul/cloud-db-inventory:backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/cloud_db_inventory
    depends_on:
      - postgres
    ports:
      - "8000:8000"

  frontend:
    image: avrahul/cloud-db-inventory:frontend
    depends_on:
      - backend
    ports:
      - "3000:80"

volumes:
  pgdata:
```

## 3) Pull and start the stack
```bash
docker compose -f docker-compose.deploy.yml pull
docker compose -f docker-compose.deploy.yml up -d
docker compose -f docker-compose.deploy.yml ps
```

## 4) Verify
- API: http://localhost:8000/health or http://localhost:8000/docs
- UI:  http://localhost:3000
- Logs: `docker compose -f docker-compose.deploy.yml logs --tail 50`

## 5) Stop / remove
```bash
docker compose -f docker-compose.deploy.yml down
```

## Notes
- The backend seeds sample data if the database is empty; rebuild without seeding if you want a blank DB.
- Change `POSTGRES_PASSWORD` for any non-dev environment and avoid exposing port 5432 publicly.
- The Postgres image includes schema only (no user data).

## Common quick fixes

- Backend can’t reach Postgres:
  - Verify compose env matches: `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/cloud_db_inventory`.
  - Pull images explicitly: `docker compose -f docker-compose.deploy.yml pull`.
  - Restart backend after DB is ready: `docker compose -f docker-compose.deploy.yml up -d backend`.
