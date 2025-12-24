# Deploying Cloud DB Inventory from Docker Hub (Private Images)

These steps let you pull the prebuilt frontend, backend, and Postgres images from the private Docker Hub repo and run them together with Docker Compose.

## Prerequisites
- Docker Engine installed (20.10+ recommended)
- Docker Compose plugin (`docker compose` command)
- Network egress to Docker Hub
- Docker Hub credentials with access to the private repo

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
