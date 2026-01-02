FROM postgres:17-alpine

# Copy initialization scripts into the container
# PostgreSQL will automatically run any .sql files in /docker-entrypoint-initdb.d/
COPY docker-initdb/ /docker-entrypoint-initdb.d/

# Set default environment for cloud_db_inventory database
ENV POSTGRES_DB=cloud_db_inventory \
    POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=postgres

LABEL maintainer="vare7" \
      description="PostgreSQL 17 with cloud-db-inventory initialization scripts"
