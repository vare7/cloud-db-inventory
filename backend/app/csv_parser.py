import csv
import io
from typing import List, Tuple, Dict, Any

from .schemas import DatabaseProvider, DatabaseRecordCreate, DatabaseStatus


def parse_csv(content: str, provider: DatabaseProvider) -> List[DatabaseRecordCreate]:
    """Original parser retained for backward compatibility (tests)."""
    records, _ = parse_csv_with_report(content, provider)
    return records


def parse_csv_with_report(content: str, provider: DatabaseProvider) -> Tuple[List[DatabaseRecordCreate], List[Dict[str, Any]]]:
    """
    Parse CSV content producing successful records and a report of skipped rows.
    Each skipped row entry contains: row_number (1-based after header), reason, and minimal context.
    Flexible column mapping for AWS and Azure exports.
    """
    # Strip UTF-8 BOM if present before parsing
    if content.startswith("\ufeff"):
        content = content[1:]
    
    reader = csv.DictReader(io.StringIO(content))
    records: List[DatabaseRecordCreate] = []
    skipped: List[Dict[str, Any]] = []

    for idx, row in enumerate(reader, start=1):
        # Normalize keys (case-insensitive, strip whitespace)
        normalized_row = {}
        for k, v in row.items():
            if k is None:
                continue
            key_norm = k.strip().lower()
            normalized_row[key_norm] = (v.strip() if v and str(v).strip() else "")

        # Base generic extraction (AWS / generic CSV)
        service_generic = (
            normalized_row.get("service")
            or normalized_row.get("service_name")
            or normalized_row.get("db_service")
            or normalized_row.get("type")
            or normalized_row.get("resource & subscription")
            or normalized_row.get("name")
            or normalized_row.get("dbinstanceidentifier")
            or normalized_row.get("db_instance_identifier")
            or normalized_row.get("db_instance_id")
            or normalized_row.get("db_identifier")
            or normalized_row.get("database")
            or normalized_row.get("dbname")
            or ""
        )
        engine_generic = (
            normalized_row.get("engine")
            or normalized_row.get("engine_type")
            or normalized_row.get("db_engine")
            or normalized_row.get("database_engine")
            or normalized_row.get("db_type")
            or ""
        )
        region_generic = (
            normalized_row.get("region")
            or normalized_row.get("location")
            or normalized_row.get("availability_zone")
            or ""
        )
        endpoint_generic = (
            normalized_row.get("endpoint")
            or normalized_row.get("endpointaddress")  # AWS camelCase
            or normalized_row.get("endpoint_address")
            or normalized_row.get("endpoint.address")
            or normalized_row.get("address")
            or normalized_row.get("hostname")
            or normalized_row.get("host")
            or normalized_row.get("server_name")
            or normalized_row.get("server")
            or normalized_row.get("fqdn")
            or ""
        )

        # Azure simple mode: prefer explicit columns (name, db_type, subscription, location, state, dbversion, storagegb)
        if provider == DatabaseProvider.azure and (
            (normalized_row.get("name") and (normalized_row.get("db_type") or normalized_row.get("dbtype") or normalized_row.get("type")))
        ):
            service = normalized_row.get("name") or service_generic
            raw_engine = (
                normalized_row.get("db_type")
                or normalized_row.get("dbtype")
                or normalized_row.get("type")
                or engine_generic
            )
            # Normalize verbose Azure type strings to canonical engines
            engine_lower = raw_engine.lower()
            if "mysql" in engine_lower:
                engine = "mysql"
            elif "postgre" in engine_lower:
                engine = "postgres"
            elif "mariadb" in engine_lower:
                engine = "mariadb"
            else:
                engine = raw_engine
            region = normalized_row.get("location") or region_generic
            # Endpoint optional in Azure simple; use FQDN if available else service as placeholder
            endpoint = (
                normalized_row.get("fqdn")
                or endpoint_generic
                or service
            )
        else:
            service = service_generic
            engine = engine_generic
            region = region_generic
            endpoint = endpoint_generic

        storage_str = (
            normalized_row.get("storage_gb")
            or normalized_row.get("storagegb")
            or normalized_row.get("storage")
            or normalized_row.get("allocated_storage")
            or normalized_row.get("allocatedstorage")  # AWS camelcase variant
            or normalized_row.get("size_gb")
            or "0"
        )
        try:
            storage_gb = int(float(storage_str.replace(",", "")))
        except (ValueError, AttributeError):
            storage_gb = 0

        status_str = (
            normalized_row.get("status")
            or normalized_row.get("state")  # Azure 'State'
            or normalized_row.get("db_instance_status")
            or normalized_row.get("dbinstancestatus")
            or normalized_row.get("availability")
            or "available"
        ).lower()
        if any(word in status_str for word in ["maintenance", "upgrading"]):
            status = DatabaseStatus.maintenance
        elif any(word in status_str for word in ["warning", "error", "failed"]):
            status = DatabaseStatus.warning
        else:
            status = DatabaseStatus.available

        subscription = (
            normalized_row.get("subscription")
            or normalized_row.get("owner")
            or normalized_row.get("owner_team")
            or normalized_row.get("team")
            or normalized_row.get("department")
            or normalized_row.get("resource & subscription")
            or ""
        )
        tags_str = (
            normalized_row.get("tags")
            or normalized_row.get("tag")
            or normalized_row.get("labels")
            or ""
        )
        tags = [t.strip() for t in tags_str.replace(";", ",").split(",") if t.strip()]

        version = (
            normalized_row.get("version")
            or normalized_row.get("dbversion")
            or normalized_row.get("engine_version")
            or normalized_row.get("engineversion")  # AWS camelcase variant
            or normalized_row.get("db_version")
            or normalized_row.get("server_version")
            or None
        )
        if version == "":
            version = None

        azure_tenant = None
        if provider == DatabaseProvider.azure:
            azure_tenant = (
                normalized_row.get("azure_tenant")
                or normalized_row.get("tenantid")
                or normalized_row.get("tenant_id")
                or normalized_row.get("tenant")
                or None
            )
            if azure_tenant == "":
                azure_tenant = None

        missing_fields = [
            name for name, value in {
                "service": service,
                "engine": engine,
                "region": region,
                "endpoint": endpoint,
            }.items() if not value
        ]
        if missing_fields:
            skipped.append({
                "row_number": idx,
                "reason": f"Missing required fields: {', '.join(missing_fields)}",
                "raw": {k: row[k] for k in row if k is not None}
            })
            continue

        if not subscription:
            subscription = "unknown"

        try:
            records.append(
                DatabaseRecordCreate(
                    provider=provider,
                    service=service,
                    engine=engine,
                    region=region,
                    endpoint=endpoint,
                    storage_gb=storage_gb,
                    status=status,
                    subscription=subscription,
                    tags=tags,
                    version=version,
                    azure_tenant=azure_tenant,
                )
            )
        except Exception as e:
            skipped.append({
                "row_number": idx,
                "reason": f"Validation error: {e}",
                "raw": {k: row[k] for k in row if k is not None}
            })
            continue

    return records, skipped

