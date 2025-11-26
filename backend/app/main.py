from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .csv_parser import parse_csv_with_report
from .database import get_db, init_db
from .schemas import (
    DatabaseProvider,
    DatabaseRecord,
    DatabaseRecordCreate,
    DatabaseStatus,
    InventoryFilters,
    StatsResponse,
)
from .store import InventoryStore

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and seed database
    init_db()
    db = next(get_db())
    try:
        InventoryStore(db).bootstrap()
    finally:
        db.close()
    yield
    # Shutdown tasks can be added here

app = FastAPI(
    title="Cloud DB Inventory",
    version="0.1.0",
    description="AWS and Azure database inventory tracker",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# (Startup handled by lifespan context.)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/databases", response_model=list[DatabaseRecord])
def list_databases(
    provider: str | None = None,
    region: str | None = None,
    status: str | None = None,
    engine: str | None = None,
    version: str | None = None,
    subscription: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
) -> list[DatabaseRecord]:
    filters = InventoryFilters(
        provider=DatabaseProvider(provider) if provider else None,
        region=region,
        status=DatabaseStatus(status) if status else None,
        engine=engine,
        version=version,
        subscription=subscription,
        search=search,
    )
    store = InventoryStore(db)
    return store.list(filters)


@app.post("/api/databases", response_model=DatabaseRecord, status_code=201)
def create_database(
    payload: DatabaseRecordCreate,
    db: Session = Depends(get_db),
) -> DatabaseRecord:
    store = InventoryStore(db)
    return store.create(payload)


@app.get("/api/databases/{record_id}", response_model=DatabaseRecord)
def get_database(
    record_id: str,
    db: Session = Depends(get_db),
) -> DatabaseRecord:
    store = InventoryStore(db)
    record = store.get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Database not found")
    return record


@app.patch("/api/databases/{record_id}/status", response_model=DatabaseRecord)
def update_status(
    record_id: str,
    status: DatabaseStatus,
    db: Session = Depends(get_db),
) -> DatabaseRecord:
    store = InventoryStore(db)
    try:
        return store.update_status(record_id, status)
    except KeyError:
        raise HTTPException(status_code=404, detail="Database not found") from None


@app.delete("/api/databases/{record_id}", status_code=204)
def delete_database(
    record_id: str,
    db: Session = Depends(get_db),
) -> None:
    """Delete a database record."""
    store = InventoryStore(db)
    deleted = store.delete(record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Database not found")


@app.get("/api/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)) -> StatsResponse:
    store = InventoryStore(db)
    return StatsResponse(**store.stats())


@app.get("/api/metrics", response_model=dict)
def get_metrics(db: Session = Depends(get_db)) -> dict:
    """Dashboard metrics: counts by RDBMS and version breakdown."""
    store = InventoryStore(db)
    return store.metrics()


@app.get("/api/upgrades", response_model=dict)
def get_upgrades(db: Session = Depends(get_db)) -> dict:
    """Get databases needing version upgrades."""
    store = InventoryStore(db)
    return store.upgrades_needed()


@app.get("/api/duplicates", response_model=dict)
def get_duplicates(db: Session = Depends(get_db)) -> dict:
    """Get potential duplicate records by provider+service+region."""
    store = InventoryStore(db)
    return store.find_duplicates()

@app.post("/api/duplicates/resolve", response_model=dict)
def resolve_duplicates(db: Session = Depends(get_db)) -> dict:
    """Resolve duplicates by keeping latest version per (provider, service, region)."""
    store = InventoryStore(db)
    try:
        return store.resolve_duplicates_keep_latest()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/filter-options", response_model=dict)
def get_filter_options(db: Session = Depends(get_db)) -> dict:
    """Get unique values for filter dropdowns."""
    store = InventoryStore(db)
    return store.get_filter_options()


@app.post("/api/databases/import-csv", response_model=dict)
async def import_csv(
    file: UploadFile = File(...),
    provider: str = Form("AWS"),
    db: Session = Depends(get_db),
) -> dict:
    """
    Import database inventory from CSV file.
    Supports AWS and Azure CSV exports with flexible column mapping.
    """
    if provider not in ["AWS", "Azure"]:
        raise HTTPException(status_code=400, detail="Provider must be AWS or Azure")

    # Convert string to DatabaseProvider enum by value
    provider_enum = DatabaseProvider.aws if provider == "AWS" else DatabaseProvider.azure

    try:
        content = (await file.read()).decode("utf-8")
    except UnicodeDecodeError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file encoding. Please use UTF-8. Error: {str(e)}"
        )

    try:
        records, skipped = parse_csv_with_report(content, provider_enum)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        error_detail = (
            f"Failed to parse CSV file. "
            f"Ensure required columns exist. Error: {str(e)}"
        )
        print(f"CSV Parse Error:\n{error_trace}")
        raise HTTPException(status_code=400, detail=error_detail)

    if not records:
        # Provide aggregated reasons for easier debugging
        missing_counts: dict[str, int] = {}
        for item in skipped:
            if item["reason"].startswith("Missing required fields"):
                for field in item["reason"].split(":", 1)[1].strip().split(","):
                    field_name = field.strip()
                    missing_counts[field_name] = missing_counts.get(field_name, 0) + 1
        detail_parts = [
            "No valid records found in CSV.",
            "Required columns for Azure: name (or Resource & Subscription), DB_Type, Location, FQDN.",
            "Required columns for AWS: service, engine, region, endpoint.",
        ]
        if missing_counts:
            detail_parts.append(
                "Observed missing field frequencies: "
                + ", ".join(f"{k}={v}" for k, v in sorted(missing_counts.items()))
            )
        raise HTTPException(status_code=400, detail=" ".join(detail_parts))

    store = InventoryStore(db)
    try:
        created, duplicates = store.bulk_create(records)
        # Delete records from DB that are not in CSV (CSV is source of truth)
        deleted = store.delete_records_not_in_csv(provider_enum, records)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Database Save Error:\n{error_trace}")
        error_detail = (
            f"Failed to save records to database. Possible connection or validation issue. Error: {str(e)}"
        )
        raise HTTPException(status_code=500, detail=error_detail)

    return {
        "message": f"Successfully imported {len(created)} database records",
        "created": len(created),
        "skipped": len(skipped),
        "duplicates": len(duplicates),
        "deleted": len(deleted),
        "skipped_details": skipped,
        "duplicates_details": duplicates,
        "deleted_details": deleted,
    }

