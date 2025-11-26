FROM python:3.12-slim AS backend

WORKDIR /app

# Install system deps (optional: build psycopg2)
RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/app ./app
# Include tests for containerized test execution (Python 3.12 runtime)
COPY backend/tests ./tests

# Environment (override in compose)
ENV PYTHONUNBUFFERED=1 \
    DATABASE_URL=postgresql://postgres:postgres@postgres:5432/cloud_db_inventory

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
