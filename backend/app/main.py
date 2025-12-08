from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, Query
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional

from .csv_parser import parse_csv_with_report
from .database import get_db, init_db
from .schemas import (
    DatabaseProvider,
    DatabaseRecord,
    DatabaseRecordCreate,
    DatabaseStatus,
    InventoryFilters,
    StatsResponse,
    AzureVM,
    AzureVMCreate,
    AzureVMFilters,
    AWSAccount,
    AWSAccountCreate,
)
from .store import InventoryStore
from .vm_store import AzureVMStore
from .vm_csv_parser import parse_azure_vm_csv
from .aws_account_store import AWSAccountStore
from .aws_account_parser import parse_aws_account_csv
# Import models to register them with SQLAlchemy Base
from .aws_account_models import AWSAccountModel

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
    exclude_stopped: bool = False,
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
    records = store.list(filters)
    # If exclude_stopped is true, filter out stopped records
    if exclude_stopped:
        records = [r for r in records if r.status != DatabaseStatus.stopped]
    return records


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

@app.delete("/api/databases", response_model=dict)
def purge_databases(db: Session = Depends(get_db)) -> dict:
    """Delete all records in the inventory."""
    store = InventoryStore(db)
    count = store.purge_all()
    return {"message": "Purged all records", "deleted": count}


@app.get("/api/stats", response_model=StatsResponse)
def get_stats(
    provider: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    engine: Optional[str] = Query(None),
    version: Optional[str] = Query(None),
    subscription: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    exclude_stopped: bool = Query(False),
    db: Session = Depends(get_db)
) -> StatsResponse:
    store = InventoryStore(db)
    filters = InventoryFilters(
        provider=provider,
        status=status,
        region=region,
        engine=engine,
        version=version,
        subscription=subscription,
        search=search
    )
    stats = store.stats(filters)
    # If exclude_stopped is true, update stats to exclude stopped records
    if exclude_stopped:
        records = store.list(filters)
        filtered_records = [r for r in records if r.status != DatabaseStatus.stopped]
        # Recalculate stats from filtered records
        stats = {
            "total": len(filtered_records),
            "by_provider": {},
            "by_status": {},
            "storage_gb_total": 0,
        }
        for record in filtered_records:
            stats["storage_gb_total"] += record.storage_gb
            provider_key = record.provider.value if hasattr(record.provider, 'value') else str(record.provider)
            stats["by_provider"][provider_key] = stats["by_provider"].get(provider_key, 0) + 1
            status_key = record.status.value if hasattr(record.status, 'value') else str(record.status)
            stats["by_status"][status_key] = stats["by_status"].get(status_key, 0) + 1
    return StatsResponse(**stats)


@app.get("/api/metrics", response_model=dict)
def get_metrics(exclude_stopped: bool = Query(False), db: Session = Depends(get_db)) -> dict:
    """Dashboard metrics: counts by RDBMS and version breakdown."""
    store = InventoryStore(db)
    metrics = store.metrics()
    
    # If exclude_stopped is true, filter out stopped records from metrics
    if exclude_stopped:
        from sqlalchemy import func as sa_func
        from .models import DatabaseRecord as DatabaseRecordModel
        
        # Get all records and filter out stopped ones
        query = db.query(DatabaseRecordModel)
        all_records = query.all()
        filtered_records = [r for r in all_records if r.status != "stopped"]
        
        # Recalculate metrics from filtered records
        def normalize_engine(name: str) -> str:
            n = (name or "").lower()
            if "postgre" in n:
                return "postgres"
            if "mysql" in n:
                return "mysql"
            if "mssql" in n or "sql server" in n or "sqlserver" in n:
                return "mssql"
            return "unknown"
        
        rdbms_counts = {"postgres": 0, "mysql": 0, "mssql": 0}
        version_counts = {"postgres": {}, "mysql": {}, "mssql": {}}
        
        for record in filtered_records:
            engine = normalize_engine(record.engine)
            if engine in rdbms_counts:
                rdbms_counts[engine] += 1
                
                # Count by version
                version = record.version or "unknown"
                if version not in version_counts[engine]:
                    version_counts[engine][version] = 0
                version_counts[engine][version] += 1
        
        metrics["rdbms_counts"] = rdbms_counts
        metrics["version_counts"] = version_counts
    
    return metrics


@app.get("/api/upgrades", response_model=dict)
def get_upgrades(
    provider: Optional[str] = Query(None),
    engine: Optional[str] = Query(None),
    version: Optional[str] = Query(None),
    subscription: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    exclude_stopped: bool = Query(False),
    db: Session = Depends(get_db)
) -> dict:
    """Get databases needing version upgrades with optional filters."""
    filters = InventoryFilters(
        provider=DatabaseProvider(provider) if provider else None,
        engine=engine,
        version=version,
        subscription=subscription,
        status=DatabaseStatus(status) if status else None,
    )
    store = InventoryStore(db)
    result = store.upgrades_needed(filters)
    
    # If exclude_stopped is true, filter out stopped records from results
    if exclude_stopped:
        result["databases"] = [r for r in result["databases"] if r.status != DatabaseStatus.stopped]
        result["total"] = len(result["databases"])
        
        # Recalculate by_engine counts
        result["by_engine"] = {"postgres": 0, "mysql": 0, "mssql": 0}
        for db_rec in result["databases"]:
            engine_key = db_rec.engine.lower()
            if "postgre" in engine_key:
                result["by_engine"]["postgres"] += 1
            elif "mysql" in engine_key:
                result["by_engine"]["mysql"] += 1
            elif "mssql" in engine_key or "sql server" in engine_key:
                result["by_engine"]["mssql"] += 1
    
    return result


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
def get_filter_options(
    provider: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> dict:
    """Get unique values for filter dropdowns, optionally filtered by provider."""
    store = InventoryStore(db)
    provider_enum = DatabaseProvider(provider) if provider else None
    return store.get_filter_options(provider_enum)


@app.get("/api/pricing", response_model=dict)
def get_pricing(exclude_stopped: bool = Query(False), db: Session = Depends(get_db)) -> dict:
    """Get pricing estimates for all database instances."""
    store = InventoryStore(db)
    pricing_data = store.calculate_pricing()
    
    # If exclude_stopped is true, filter out stopped records
    if exclude_stopped:
        pricing_data["databases"] = [
            db_rec for db_rec in pricing_data["databases"] 
            if db_rec.get("status") != "stopped"
        ]
        
        # Recalculate totals
        total_hourly = sum(db_rec.get("hourly_cost", 0) for db_rec in pricing_data["databases"])
        total_monthly = sum(db_rec.get("monthly_cost", 0) for db_rec in pricing_data["databases"])
        
        pricing_data["total_hourly"] = total_hourly
        pricing_data["total_monthly"] = total_monthly
        pricing_data["count"] = len(pricing_data["databases"])
    
    return pricing_data


@app.post("/api/databases/import-csv", response_model=dict)
async def import_csv(
    file: UploadFile = File(...),
    provider: str = Form("AWS"),
    purge_first: bool = Form(False),
    sync: bool = Form(False),
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
    if purge_first:
        store.purge_all()
    try:
        created, duplicates = store.bulk_create(records)
        # Only sync (delete records not in CSV) if explicitly requested
        deleted = []
        if sync:
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


# ============= Azure VMs Endpoints =============

@app.get("/api/azure-vms", response_model=list[AzureVM])
def list_azure_vms(
    region: Optional[str] = Query(None),
    subscription: Optional[str] = Query(None),
    tenant_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    os_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> list[AzureVM]:
    """List Azure VMs with optional filters."""
    store = AzureVMStore(db)
    filters = AzureVMFilters(
        region=region,
        subscription=subscription,
        tenant_id=tenant_id,
        status=status,
        os_type=os_type,
        search=search,
    )
    return store.list(filters)


@app.get("/api/azure-vms/{vm_id}", response_model=AzureVM)
def get_azure_vm(vm_id: str, db: Session = Depends(get_db)) -> AzureVM:
    """Get a specific Azure VM."""
    store = AzureVMStore(db)
    vm = store.get(vm_id)
    if not vm:
        raise HTTPException(status_code=404, detail="VM not found")
    return vm


@app.post("/api/azure-vms", response_model=AzureVM)
def create_azure_vm(vm: AzureVMCreate, db: Session = Depends(get_db)) -> AzureVM:
    """Create a new Azure VM record."""
    store = AzureVMStore(db)
    return store.create(vm)


@app.delete("/api/azure-vms/{vm_id}")
def delete_azure_vm(vm_id: str, db: Session = Depends(get_db)) -> dict:
    """Delete an Azure VM record."""
    store = AzureVMStore(db)
    if not store.delete(vm_id):
        raise HTTPException(status_code=404, detail="VM not found")
    return {"message": "VM deleted successfully"}


@app.post("/api/azure-vms/import-csv")
def import_azure_vms_csv(
    file: UploadFile = File(...),
    purge_first: bool = Form(False),
    db: Session = Depends(get_db),
) -> dict:
    """Import Azure VMs from CSV file."""
    store = AzureVMStore(db)
    
    # Purge if requested
    if purge_first:
        deleted_count = store.purge_all()
    else:
        deleted_count = 0
    
    # Parse and import CSV
    try:
        content = file.file.read()
        parsed_vms, skipped = parse_azure_vm_csv(content)
        
        if parsed_vms:
            imported_count = store.create_bulk(parsed_vms)
        else:
            imported_count = 0
        
        return {
            "message": "Import completed",
            "imported": imported_count,
            "skipped": len(skipped),
            "purged": deleted_count,
            "skipped_details": skipped,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV parsing error: {str(e)}")


@app.delete("/api/azure-vms")
def purge_all_azure_vms(db: Session = Depends(get_db)) -> dict:
    """Delete all Azure VM records."""
    store = AzureVMStore(db)
    count = store.purge_all()
    return {"message": "Purged all Azure VM records", "deleted": count}


@app.get("/api/azure-vms-filter-options")
def get_azure_vms_filter_options(db: Session = Depends(get_db)) -> dict:
    """Get available filter options for Azure VMs."""
    store = AzureVMStore(db)
    return store.get_filter_options()


@app.get("/api/tenant-names")
def get_tenant_names(db: Session = Depends(get_db)) -> dict:
    """Get all tenant ID to friendly name mappings."""
    from .tenant_mapping import AzureTenantMapping
    mappings = db.query(AzureTenantMapping).all()
    return {mapping.tenant_id: mapping.friendly_name for mapping in mappings}


@app.post("/api/aws-accounts/import-csv")
def import_aws_accounts_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> dict:
    """Import AWS accounts from CSV file. Uses upsert to update existing records."""
    store = AWSAccountStore(db)
    
    # Parse and import CSV (upsert mode - updates existing, creates new)
    try:
        parsed_accounts = parse_aws_account_csv(file.file)
        
        if parsed_accounts:
            imported_count = store.bulk_upsert(parsed_accounts)
        else:
            imported_count = 0
        
        return {
            "message": "Import completed (existing accounts updated)",
            "imported": imported_count,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV parsing error: {str(e)}")


@app.get("/api/aws-account-names")
def get_aws_account_names(db: Session = Depends(get_db)) -> dict:
    """Get mapping of AWS account IDs to friendly names."""
    store = AWSAccountStore(db)
    return store.get_account_names_map()


@app.get("/api/aws-accounts")
def list_aws_accounts(db: Session = Depends(get_db)) -> list[AWSAccount]:
    """List all AWS accounts."""
    store = AWSAccountStore(db)
    return store.list_all()
