from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class DatabaseProvider(str, Enum):
    aws = "AWS"
    azure = "Azure"


class DatabaseStatus(str, Enum):
    available = "available"
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

