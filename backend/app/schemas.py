from enum import Enum
from typing import List, Optional
from datetime import datetime

from pydantic import BaseModel, Field


class DatabaseProvider(str, Enum):
    aws = "AWS"
    azure = "Azure"


class DatabaseStatus(str, Enum):
    available = "available"
    ready = "ready"
    stopped = "stopped"
    maintenance = "maintenance"
    warning = "warning"


class DatabaseRecordBase(BaseModel):
    provider: DatabaseProvider
    service: str = Field(..., description="e.g., RDS, Cosmos DB")
    engine: str = Field(..., description="e.g., postgres, mysql")
    region: str
    endpoint: str
    storage_gb: int = Field(..., ge=0)
    status: DatabaseStatus = DatabaseStatus.available
    subscription: str
    tags: List[str] = Field(default_factory=list)
    version: Optional[str] = Field(None, description="Database version/engine version")
    azure_tenant: Optional[str] = Field(None, description="Azure tenant ID (Azure only)")
    
    # Additional detailed fields
    availability_zone: Optional[str] = Field(None, description="Availability zone")
    auto_scaling: Optional[str] = Field(None, description="Auto scaling configuration")
    iops: Optional[str] = Field(None, description="IOPS configuration")
    high_availability_state: Optional[str] = Field(None, description="High availability state")
    replica: Optional[str] = Field(None, description="Replica configuration")
    backup_retention_days: Optional[str] = Field(None, description="Backup retention in days")
    geo_redundant_backup: Optional[str] = Field(None, description="Geo-redundant backup configuration")


class DatabaseRecordCreate(DatabaseRecordBase):
    pass


class DatabaseRecord(DatabaseRecordBase):
    id: str


class StatsResponse(BaseModel):
    total: int
    by_provider: dict
    by_status: dict
    storage_gb_total: int


class InventoryFilters(BaseModel):
    provider: Optional[DatabaseProvider] = None
    region: Optional[str] = None
    status: Optional[DatabaseStatus] = None
    engine: Optional[str] = None
    version: Optional[str] = None
    subscription: Optional[str] = None
    search: Optional[str] = None


class AzureVMBase(BaseModel):
    computer_name: Optional[str] = None
    private_ip_address: Optional[str] = None
    subscription: str
    resource_group: str
    location: str
    vm_size: str
    os_type: str
    os_name: Optional[str] = None
    os_version: Optional[str] = None
    os_disk_size: Optional[int] = None
    data_disk_count: Optional[int] = None
    total_disk_size_gb: Optional[int] = None
    display_status: Optional[str] = None
    time_created: Optional[datetime] = None
    tenant_id: Optional[str] = None


class AzureVMCreate(AzureVMBase):
    pass


class AzureVM(AzureVMBase):
    id: str


class AzureVMFilters(BaseModel):
    region: Optional[str] = None
    subscription: Optional[str] = None
    tenant_id: Optional[str] = None
    search: Optional[str] = None
