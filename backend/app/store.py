from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, String

from .schemas import (
    DatabaseRecord,
    DatabaseRecordCreate,
    DatabaseStatus,
    DatabaseProvider,
    InventoryFilters,
)
from .models import DatabaseRecordModel
from .seed_data import SEED_DATABASES


class InventoryStore:
    """PostgreSQL-backed store for database inventory."""

    def __init__(self, db: Session):
        self.db = db

    def bootstrap(self) -> None:
        """Seed database with initial data if empty."""
        count = self.db.query(func.count(DatabaseRecordModel.id)).scalar()
        if count == 0:
            for record_data in SEED_DATABASES:
                db_record = DatabaseRecordModel(**record_data)
                self.db.add(db_record)
            self.db.commit()

    def list(self, filters: InventoryFilters) -> List[DatabaseRecord]:
        query = self.db.query(DatabaseRecordModel)

        if filters.provider:
            query = query.filter(DatabaseRecordModel.provider == filters.provider)
        if filters.region:
            query = query.filter(
                func.lower(DatabaseRecordModel.region) == filters.region.lower()
            )
        if filters.status:
            query = query.filter(DatabaseRecordModel.status == filters.status)
        if filters.engine:
            query = query.filter(
                func.lower(DatabaseRecordModel.engine).contains(filters.engine.lower())
            )
        if filters.version:
            query = query.filter(
                func.lower(DatabaseRecordModel.version).contains(filters.version.lower())
            )
        if filters.subscription:
            query = query.filter(
                func.lower(DatabaseRecordModel.subscription).contains(filters.subscription.lower())
            )
        if filters.search:
            text = filters.search.lower()
            # PostgreSQL array contains check for tags
            query = query.filter(
                or_(
                    func.lower(DatabaseRecordModel.engine).contains(text),
                    func.lower(DatabaseRecordModel.service).contains(text),
                    func.lower(DatabaseRecordModel.endpoint).contains(text),
                    func.cast(DatabaseRecordModel.tags, String).ilike(f"%{text}%"),
                )
            )

        db_records = query.all()
        return [self._model_to_schema(record) for record in db_records]

    def get(self, record_id: str) -> Optional[DatabaseRecord]:
        db_record = self.db.query(DatabaseRecordModel).filter(
            DatabaseRecordModel.id == record_id
        ).first()
        if not db_record:
            return None
        return self._model_to_schema(db_record)

    def create(self, data: DatabaseRecordCreate) -> DatabaseRecord:
        db_record = DatabaseRecordModel(**data.model_dump())
        self.db.add(db_record)
        self.db.commit()
        self.db.refresh(db_record)
        return self._model_to_schema(db_record)

    def delete(self, record_id: str) -> bool:
        """Delete a database record by ID. Returns True if deleted, False if not found."""
        db_record = self.db.query(DatabaseRecordModel).filter(
            DatabaseRecordModel.id == record_id
        ).first()
        if not db_record:
            return False
        self.db.delete(db_record)
        self.db.commit()
        return True

    def bulk_create(self, data_list: List[DatabaseRecordCreate]) -> tuple[List[DatabaseRecord], List[dict]]:
        """
        Create multiple records in a single operation, skipping duplicates.
        Returns: (created_records, duplicates_skipped)
        Duplicate detection: provider + service + region combination
        """
        db_records = []
        duplicates = []
        
        for data in data_list:
            try:
                # Check if record already exists (provider + service + region)
                existing = self.db.query(DatabaseRecordModel).filter(
                    DatabaseRecordModel.provider == data.provider,
                    DatabaseRecordModel.service == data.service,
                    DatabaseRecordModel.region == data.region
                ).first()
                
                if existing:
                    duplicates.append({
                        "provider": data.provider.value,
                        "service": data.service,
                        "region": data.region,
                        "reason": "Already exists in database"
                    })
                    continue
                
                db_record = DatabaseRecordModel(**data.model_dump())
                db_records.append(db_record)
            except Exception as e:
                # Log which record failed
                print(f"Error creating record: {e}")
                print(f"  Data: {data.model_dump()}")
                raise
        
        try:
            if db_records:
                self.db.add_all(db_records)
                self.db.commit()
                for record in db_records:
                    self.db.refresh(record)
            return [self._model_to_schema(record) for record in db_records], duplicates
        except Exception as e:
            self.db.rollback()
            raise

    def delete_records_not_in_csv(self, provider: DatabaseProvider, csv_records: List[DatabaseRecordCreate]) -> List[dict]:
        """
        Delete records from database that don't exist in the CSV import.
        CSV is the source of truth. Returns list of deleted records.
        """
        # Create set of (provider, service, region) tuples from CSV
        csv_keys = {
            (rec.provider, rec.service, rec.region)
            for rec in csv_records
        }
        
        # Find all existing records for this provider
        existing = self.db.query(DatabaseRecordModel).filter(
            DatabaseRecordModel.provider == provider
        ).all()
        
        deleted = []
        for record in existing:
            key = (record.provider, record.service, record.region)
            if key not in csv_keys:
                deleted.append({
                    "provider": record.provider.value,
                    "service": record.service,
                    "engine": record.engine,
                    "region": record.region,
                    "endpoint": record.endpoint
                })
                self.db.delete(record)
        
        if deleted:
            self.db.commit()
        
        return deleted

    def update_status(self, record_id: str, status: DatabaseStatus) -> DatabaseRecord:
        db_record = self.db.query(DatabaseRecordModel).filter(
            DatabaseRecordModel.id == record_id
        ).first()
        if not db_record:
            raise KeyError(record_id)
        db_record.status = status
        self.db.commit()
        self.db.refresh(db_record)
        return self._model_to_schema(db_record)

    def stats(self) -> dict:
        total = self.db.query(func.count(DatabaseRecordModel.id)).scalar()

        # Count by provider
        by_provider_result = (
            self.db.query(
                DatabaseRecordModel.provider,
                func.count(DatabaseRecordModel.id)
            )
            .group_by(DatabaseRecordModel.provider)
            .all()
        )
        by_provider = {provider: count for provider, count in by_provider_result}

        # Count by status
        by_status_result = (
            self.db.query(
                DatabaseRecordModel.status,
                func.count(DatabaseRecordModel.id)
            )
            .group_by(DatabaseRecordModel.status)
            .all()
        )
        by_status = {status: count for status, count in by_status_result}

        # Total storage
        storage_result = self.db.query(
            func.sum(DatabaseRecordModel.storage_gb)
        ).scalar()
        storage_gb_total = int(storage_result) if storage_result else 0

        return {
            "total": total,
            "by_provider": by_provider,
            "by_status": by_status,
            "storage_gb_total": storage_gb_total,
        }

    def find_duplicates(self) -> dict:
        """Find potential duplicate records based on provider + service + region.
        Returns a summary with groups having count > 1 and the affected records.
        """
        # Count duplicates by composite key
        groups = (
            self.db.query(
                DatabaseRecordModel.provider,
                DatabaseRecordModel.service,
                DatabaseRecordModel.region,
                func.count(DatabaseRecordModel.id).label("count")
            )
            .group_by(
                DatabaseRecordModel.provider,
                DatabaseRecordModel.service,
                DatabaseRecordModel.region,
            )
            .having(func.count(DatabaseRecordModel.id) > 1)
            .all()
        )

        duplicate_groups: list[dict] = []
        total_duplicates = 0
        for provider, service, region, count in groups:
            # Fetch records for this group
            records = (
                self.db.query(DatabaseRecordModel)
                .filter(
                    DatabaseRecordModel.provider == provider,
                    DatabaseRecordModel.service == service,
                    DatabaseRecordModel.region == region,
                )
                .all()
            )
            dup_records = [self._model_to_schema(r) for r in records]
            duplicate_groups.append({
                "provider": provider.value if hasattr(provider, "value") else provider,
                "service": service,
                "region": region,
                "count": count,
                "records": dup_records,
            })
            total_duplicates += count

        return {
            "groups": duplicate_groups,
            "groups_count": len(duplicate_groups),
            "records_count": total_duplicates,
        }

    def _parse_version(self, v: Optional[str]) -> Tuple[int, ...]:
        if not v:
            return tuple()
        # Accept versions like "13", "13.3", "8.0.36"; non-numeric parts treated as 0
        parts = []
        for p in str(v).split("."):
            try:
                parts.append(int(p))
            except ValueError:
                # Strip non-digit prefix/suffix
                num = "".join(ch for ch in p if ch.isdigit())
                parts.append(int(num) if num else 0)
        return tuple(parts)

    def resolve_duplicates_keep_latest(self) -> Dict[str, Any]:
        # Find duplicate keys
        dup_keys = (
            self.db.query(
                DatabaseRecordModel.provider,
                DatabaseRecordModel.service,
                DatabaseRecordModel.region,
            )
            .group_by(
                DatabaseRecordModel.provider,
                DatabaseRecordModel.service,
                DatabaseRecordModel.region,
            )
            .having(func.count(DatabaseRecordModel.id) > 1)
            .all()
        )

        deleted_ids: List[int] = []
        kept: List[int] = []
        details: List[Dict[str, Any]] = []

        for provider, service, region in dup_keys:
            rows: List[DatabaseRecordModel] = (
                self.db.query(DatabaseRecordModel)
                .filter(
                    DatabaseRecordModel.provider == provider,
                    DatabaseRecordModel.service == service,
                    DatabaseRecordModel.region == region,
                )
                .all()
            )
            # Choose latest by parsed version; tie-breaker by highest id
            rows_sorted = sorted(
                rows,
                key=lambda r: (self._parse_version(r.version), r.id),
                reverse=True,
            )
            keep = rows_sorted[0]
            to_delete = rows_sorted[1:]
            kept.append(keep.id)
            for r in to_delete:
                deleted_ids.append(r.id)
                self.db.delete(r)
            details.append(
                {
                    "key": {
                        "provider": provider,
                        "service": service,
                        "region": region,
                    },
                    "kept_id": keep.id,
                    "kept_version": keep.version,
                    "deleted_ids": [r.id for r in to_delete],
                }
            )

        if deleted_ids:
            self.db.commit()

        return {
            "keys_processed": len(dup_keys),
            "kept_count": len(kept),
            "deleted_count": len(deleted_ids),
            "kept_ids": kept,
            "deleted_ids": deleted_ids,
            "details": details,
        }

    def metrics(self) -> dict:
        """Return RDBMS counts and version breakdown for postgres, mysql, mssql."""
        db_records = self.db.query(DatabaseRecordModel.engine, DatabaseRecordModel.version).all()

        def normalize_engine(name: str) -> str:
            n = (name or "").lower()
            if "postgre" in n:
                return "postgres"
            if "mysql" in n:
                return "mysql"
            if "mssql" in n or "sql server" in n or "sqlserver" in n:
                return "mssql"
            return n or "unknown"

        rdbms_counts: dict[str, int] = {"postgres": 0, "mysql": 0, "mssql": 0}
        version_counts: dict[str, dict[str, int]] = {"postgres": {}, "mysql": {}, "mssql": {}}

        for engine, version in db_records:
            key = normalize_engine(engine)
            if key in rdbms_counts:
                rdbms_counts[key] += 1
                v = version or "unknown"
                vc = version_counts[key]
                vc[v] = vc.get(v, 0) + 1

        total_tracked = sum(rdbms_counts.values())

        return {
            "rdbms_counts": rdbms_counts,
            "rdbms_percentages": {k: (v / total_tracked * 100 if total_tracked else 0) for k, v in rdbms_counts.items()},
            "version_counts": version_counts,
        }

    def upgrades_needed(self) -> dict:
        """Return databases that need version upgrades based on minimum thresholds."""
        db_records = self.db.query(DatabaseRecordModel).all()

        def normalize_engine(name: str) -> str:
            n = (name or "").lower()
            if "postgre" in n:
                return "postgres"
            if "mysql" in n:
                return "mysql"
            if "mssql" in n or "sql server" in n or "sqlserver" in n:
                return "mssql"
            return "unknown"

        def needs_upgrade(engine: str, version: str) -> bool:
            """Check if version is below minimum threshold."""
            if not version:
                return True  # Unknown version assumed needs upgrade
            v = version.lower()
            if engine == "postgres":
                # Extract major version (e.g., "15.4" -> 15)
                try:
                    major = int(v.split('.')[0]) if '.' in v else int(v.split()[0])
                    return major < 13
                except (ValueError, IndexError):
                    return True
            elif engine == "mysql":
                # Check >= 8.0
                try:
                    parts = v.split('.')
                    major = int(parts[0])
                    minor = int(parts[1]) if len(parts) > 1 else 0
                    return major < 8 or (major == 8 and minor < 0)
                except (ValueError, IndexError):
                    return True
            elif engine == "mssql":
                # SQL Server 2017 or later
                if "2017" in v or "2019" in v or "2022" in v or "2025" in v:
                    return False
                if "2016" in v or "2014" in v or "2012" in v or "2008" in v:
                    return True
                return True  # Unknown
            return False

        upgrade_list = []
        for rec in db_records:
            engine_key = normalize_engine(rec.engine)
            if engine_key in ["postgres", "mysql", "mssql"]:
                if needs_upgrade(engine_key, rec.version):
                    upgrade_list.append(self._model_to_schema(rec))

        # Count by engine
        counts = {"postgres": 0, "mysql": 0, "mssql": 0}
        for item in upgrade_list:
            eng = normalize_engine(item.engine)
            if eng in counts:
                counts[eng] += 1

        return {
            "total": len(upgrade_list),
            "by_engine": counts,
            "databases": upgrade_list,
        }

    def get_filter_options(self) -> dict:
        """Return unique values for filter dropdowns."""
        # Get distinct regions
        regions = [r[0] for r in self.db.query(DatabaseRecordModel.region).distinct().all() if r[0]]
        
        # Get distinct engines
        engines = [e[0] for e in self.db.query(DatabaseRecordModel.engine).distinct().all() if e[0]]
        
        # Get distinct versions
        versions = [v[0] for v in self.db.query(DatabaseRecordModel.version).distinct().all() if v[0]]
        
        # Get distinct subscriptions
        subscriptions = [s[0] for s in self.db.query(DatabaseRecordModel.subscription).distinct().all() if s[0]]
        
        return {
            "regions": sorted(regions),
            "engines": sorted(engines),
            "versions": sorted(versions),
            "subscriptions": sorted(subscriptions),
        }

    @staticmethod
    def _model_to_schema(db_record: DatabaseRecordModel) -> DatabaseRecord:
        """Convert SQLAlchemy model to Pydantic schema."""
        return DatabaseRecord(
            id=db_record.id,
            provider=db_record.provider,
            service=db_record.service,
            engine=db_record.engine,
            region=db_record.region,
            endpoint=db_record.endpoint,
            storage_gb=db_record.storage_gb,
            status=db_record.status,
            subscription=db_record.subscription,
            tags=db_record.tags or [],
            version=db_record.version,
            azure_tenant=db_record.azure_tenant,
        )
