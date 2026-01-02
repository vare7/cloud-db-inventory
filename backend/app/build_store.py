from __future__ import annotations

from datetime import date, datetime
from typing import List

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .models import BuildInfoModel
from .schemas import BuildFilters, BuildInfo
from .seed_data import SEED_BUILD_CATALOG


class BuildStore:
    """PostgreSQL-backed store for database engine build metadata."""

    def __init__(self, db: Session):
        self.db = db

    def bootstrap(self) -> None:
        """Seed build catalog if empty."""
        count = self.db.query(func.count(BuildInfoModel.id)).scalar()
        if count:
            return

        def _to_date(value: str | date | None) -> date | None:
            if value is None:
                return None
            if isinstance(value, date):
                return value
            try:
                return datetime.fromisoformat(str(value)).date()
            except Exception:
                return None

        records: list[BuildInfoModel] = []
        for item in SEED_BUILD_CATALOG:
            record = BuildInfoModel(
                engine=item["engine"],
                version=item["version"],
                build_number=item["build_number"],
                release_date=_to_date(item.get("release_date")) or date.today(),
                update_label=item.get("update"),
                doc_label=item["doc_label"],
                doc_url=item["doc_url"],
                support_end=_to_date(item.get("support_end")),
                maintenance_end=_to_date(item.get("maintenance_end")),
            )
            records.append(record)

        self.db.add_all(records)
        self.db.commit()

    def list(self, filters: BuildFilters | None = None) -> List[BuildInfo]:
        query = self.db.query(BuildInfoModel)

        if filters:
            if filters.engine:
                query = query.filter(func.lower(BuildInfoModel.engine) == filters.engine.lower())
            if filters.version:
                query = query.filter(func.lower(BuildInfoModel.version) == filters.version.lower())
            if filters.search:
                text = f"%{filters.search.lower()}%"
                query = query.filter(
                    or_(
                        func.lower(BuildInfoModel.engine).like(text),
                        func.lower(BuildInfoModel.version).like(text),
                        func.lower(BuildInfoModel.build_number).like(text),
                        func.lower(BuildInfoModel.update_label).like(text),
                        func.lower(BuildInfoModel.doc_label).like(text),
                    )
                )

        query = query.order_by(BuildInfoModel.release_date.desc())
        rows = query.all()
        return [self._model_to_schema(row) for row in rows]

    def _model_to_schema(self, record: BuildInfoModel) -> BuildInfo:
        return BuildInfo(
            id=record.id,
            engine=record.engine,
            version=record.version,
            build_number=record.build_number,
            release_date=record.release_date,
            update=record.update_label,
            doc_label=record.doc_label,
            doc_url=record.doc_url,
            support_end=record.support_end,
            maintenance_end=record.maintenance_end,
        )
