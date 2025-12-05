"""Store for Azure VM inventory."""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, String

from .schemas import AzureVM, AzureVMCreate, AzureVMFilters
from .vm_models import AzureVMModel


class AzureVMStore:
    """PostgreSQL-backed store for Azure VM inventory."""

    def __init__(self, db: Session):
        self.db = db

    def list(self, filters: AzureVMFilters) -> List[AzureVM]:
        """List Azure VMs with optional filters."""
        query = self.db.query(AzureVMModel)

        if filters.region:
            query = query.filter(
                func.lower(AzureVMModel.location) == filters.region.lower()
            )
        if filters.subscription:
            query = query.filter(
                func.lower(AzureVMModel.subscription).contains(filters.subscription.lower())
            )
        if filters.tenant_id:
            query = query.filter(AzureVMModel.tenant_id == filters.tenant_id)
        if filters.status:
            query = query.filter(
                func.lower(AzureVMModel.display_status) == filters.status.lower()
            )
        if filters.search:
            text = filters.search.lower()
            query = query.filter(
                or_(
                    func.lower(AzureVMModel.computer_name).contains(text),
                    func.lower(AzureVMModel.resource_group).contains(text),
                )
            )

        vms = query.all()
        return [self._model_to_schema(vm) for vm in vms]

    def get(self, vm_id: str) -> Optional[AzureVM]:
        """Get a specific VM by ID."""
        vm = self.db.query(AzureVMModel).filter(
            AzureVMModel.id == vm_id
        ).first()
        if not vm:
            return None
        return self._model_to_schema(vm)

    def create(self, data: AzureVMCreate) -> AzureVM:
        """Create a new VM record."""
        vm = AzureVMModel(**data.model_dump())
        self.db.add(vm)
        self.db.commit()
        self.db.refresh(vm)
        return self._model_to_schema(vm)

    def create_bulk(self, vms: List[AzureVMCreate]) -> int:
        """Bulk create VM records."""
        vm_models = [AzureVMModel(**vm.model_dump()) for vm in vms]
        self.db.add_all(vm_models)
        self.db.commit()
        return len(vm_models)

    def delete(self, vm_id: str) -> bool:
        """Delete a VM record."""
        result = self.db.query(AzureVMModel).filter(
            AzureVMModel.id == vm_id
        ).delete()
        self.db.commit()
        return result > 0

    def purge_all(self) -> int:
        """Delete all VM records."""
        count = self.db.query(AzureVMModel).delete()
        self.db.commit()
        return count

    def get_filter_options(self) -> dict:
        """Get available filter options."""
        regions = self.db.query(AzureVMModel.location).distinct().all()
        subscriptions = self.db.query(AzureVMModel.subscription).distinct().all()
        tenants = self.db.query(AzureVMModel.tenant_id).distinct().all()
        statuses = self.db.query(AzureVMModel.display_status).distinct().all()

        return {
            "regions": [r[0] for r in regions if r[0]],
            "subscriptions": [s[0] for s in subscriptions if s[0]],
            "tenants": [t[0] for t in tenants if t[0]],
            "statuses": sorted([s[0] for s in statuses if s[0]]),
        }

    def _model_to_schema(self, vm: AzureVMModel) -> AzureVM:
        """Convert SQLAlchemy model to Pydantic schema."""
        return AzureVM(
            id=vm.id,
            computer_name=vm.computer_name,
            private_ip_address=vm.private_ip_address,
            subscription=vm.subscription,
            resource_group=vm.resource_group,
            location=vm.location,
            vm_size=vm.vm_size,
            os_type=vm.os_type,
            os_name=vm.os_name,
            os_version=vm.os_version,
            os_disk_size=vm.os_disk_size,
            data_disk_count=vm.data_disk_count,
            total_disk_size_gb=vm.total_disk_size_gb,
            display_status=vm.display_status,
            time_created=vm.time_created,
            tenant_id=vm.tenant_id,
        )
