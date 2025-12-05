import csv
import io
from typing import List, Tuple, Dict, Any
import logging

from .schemas import DatabaseProvider, DatabaseRecordCreate, DatabaseStatus

logger = logging.getLogger(__name__)


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

        # Skip "SQL Server (Arc)" records - these are VMs managed in separate Azure VMs tab
        db_type = (
            normalized_row.get("db_type")
            or normalized_row.get("dbtype")
            or normalized_row.get("type")
            or ""
        )
        if db_type and "sql server (arc)" in db_type.lower():
            skipped.append({
                "row_number": idx,
                "reason": "Skipped: SQL Server (Arc) records are managed in the Azure VMs tab",
                "raw": {k: row[k] for k in row if k is not None}
            })
            continue

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
            or normalized_row.get("instance_status")
            or normalized_row.get("power_state")
            or normalized_row.get("resource_state")
            or "available"
        ).lower().strip()
        
        # Debug logging to see what status is being read
        logger.info(f"Row {idx}: Raw status_str='{status_str}', provider={provider}")
        
        # For Azure resources, map states to appropriate status values
        if provider == DatabaseProvider.azure:
            # Azure State field typically has: "Ready" or "Stopped"
            # Map "Ready" to available (will display as "Running" in UI)
            if "stopped" in status_str or "deallocated" in status_str or status_str == "stopped":
                status = DatabaseStatus.stopped
            elif "ready" in status_str or status_str == "ready":
                status = DatabaseStatus.available
            elif "running" in status_str or status_str == "running":
                status = DatabaseStatus.available
            elif any(word in status_str for word in ["maintenance", "upgrading", "updating"]):
                status = DatabaseStatus.maintenance
            elif any(word in status_str for word in ["warning", "error", "failed"]):
                status = DatabaseStatus.warning
            else:
                # Default to available if we can't determine
                status = DatabaseStatus.available
        else:
            # AWS and generic status mapping
            if "stopped" in status_str or status_str == "stopped":
                status = DatabaseStatus.stopped
            elif "ready" in status_str or status_str == "ready":
                status = DatabaseStatus.ready
            elif any(word in status_str for word in ["maintenance", "upgrading", "updating"]):
                status = DatabaseStatus.maintenance
            elif any(word in status_str for word in ["warning", "error", "failed", "stopping"]):
                status = DatabaseStatus.warning
            else:
                status = DatabaseStatus.available

        subscription = (
            normalized_row.get("subscription")
            or normalized_row.get("accountid")  # AWS Account ID
            or normalized_row.get("account_id")
            or normalized_row.get("account")
            or normalized_row.get("aws_account_id")
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

        # Extract detailed fields (optional for all providers)
        availability_zone = (
            normalized_row.get("availabilityzone")
            or normalized_row.get("availability_zone")
            or normalized_row.get("az")
            or None
        )
        if availability_zone == "":
            availability_zone = None

        auto_scaling = (
            normalized_row.get("autoscaling")
            or normalized_row.get("auto_scaling")
            or normalized_row.get("autogrow")
            or normalized_row.get("autoioscaling")
            or None
        )
        if auto_scaling == "":
            auto_scaling = None

        iops = (
            normalized_row.get("iops")
            or normalized_row.get("io_operations")
            or None
        )
        if iops == "":
            iops = None

        high_availability_state = (
            normalized_row.get("highavailabilitystate")
            or normalized_row.get("high_availability_state")
            or normalized_row.get("ha_state")
            or normalized_row.get("highavailabilitymode")
            or None
        )
        if high_availability_state == "":
            high_availability_state = None

        replica = (
            normalized_row.get("replica")
            or normalized_row.get("replicas")
            or normalized_row.get("replication")
            or None
        )
        if replica == "":
            replica = None

        backup_retention_days = (
            normalized_row.get("backupretentiondays")
            or normalized_row.get("backup_retention_days")
            or normalized_row.get("backup_retention")
            or None
        )
        if backup_retention_days == "":
            backup_retention_days = None

        geo_redundant_backup = (
            normalized_row.get("georedundantbackup")
            or normalized_row.get("geo_redundant_backup")
            or normalized_row.get("geo_backup")
            or None
        )
        if geo_redundant_backup == "":
            geo_redundant_backup = None

        # Only service and region are truly required; engine and endpoint can be inferred or optional
        missing_fields = []
        if not service:
            missing_fields.append("service")
        if not region:
            missing_fields.append("region")
        
        if missing_fields:
            skipped.append({
                "row_number": idx,
                "reason": f"Missing required fields: {', '.join(missing_fields)}",
                "raw": {k: row[k] for k in row if k is not None}
            })
            continue
        
        # Set defaults for optional fields
        if not engine:
            engine = "unknown"
        if not endpoint:
            endpoint = service  # Use service name as fallback

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
                                    availability_zone=availability_zone,
                                    auto_scaling=auto_scaling,
                                    iops=iops,
                                    high_availability_state=high_availability_state,
                                    replica=replica,
                                    backup_retention_days=backup_retention_days,
                                    geo_redundant_backup=geo_redundant_backup,
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

