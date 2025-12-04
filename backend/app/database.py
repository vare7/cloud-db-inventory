from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment variable, with fallback
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/cloud_db_inventory"
)

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables and ensure new columns exist."""
    Base.metadata.create_all(bind=engine)
    # Ensure newly added nullable columns exist on existing deployments
    try:
        from sqlalchemy import text
        with engine.begin() as conn:
            conn.execute(text(
                """
                ALTER TABLE database_records
                ADD COLUMN IF NOT EXISTS availability_zone VARCHAR NULL;
                """
            ))
            conn.execute(text(
                """
                ALTER TABLE database_records
                ADD COLUMN IF NOT EXISTS auto_scaling VARCHAR NULL;
                """
            ))
            conn.execute(text(
                """
                ALTER TABLE database_records
                ADD COLUMN IF NOT EXISTS iops VARCHAR NULL;
                """
            ))
            conn.execute(text(
                """
                ALTER TABLE database_records
                ADD COLUMN IF NOT EXISTS high_availability_state VARCHAR NULL;
                """
            ))
            conn.execute(text(
                """
                ALTER TABLE database_records
                ADD COLUMN IF NOT EXISTS replica VARCHAR NULL;
                """
            ))
            conn.execute(text(
                """
                ALTER TABLE database_records
                ADD COLUMN IF NOT EXISTS backup_retention_days VARCHAR NULL;
                """
            ))
            conn.execute(text(
                """
                ALTER TABLE database_records
                ADD COLUMN IF NOT EXISTS geo_redundant_backup VARCHAR NULL;
                """
            ))
    except Exception as e:
        # Log and continue; table might not exist yet or permissions differ
        print(f"Schema migration check failed: {e}")
    
    # Initialize tenant mappings
    try:
        from .tenant_mapping import init_tenant_mappings
        db = SessionLocal()
        init_tenant_mappings(db)
        db.close()
    except Exception as e:
        print(f"Tenant mapping initialization failed: {e}")

