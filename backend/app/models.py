from sqlalchemy import Column, String, Integer, Enum as SQLEnum, ARRAY
import uuid
from .database import Base
from .schemas import DatabaseProvider, DatabaseStatus


class DatabaseRecordModel(Base):
    __tablename__ = "database_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    provider = Column(SQLEnum(DatabaseProvider, values_callable=lambda x: [e.value for e in x]), nullable=False)
    service = Column(String, nullable=False, unique=True)
    engine = Column(String, nullable=False)
    region = Column(String, nullable=False)
    endpoint = Column(String, nullable=False, unique=True)
    storage_gb = Column(Integer, nullable=False)
    status = Column(SQLEnum(DatabaseStatus, values_callable=lambda x: [e.value for e in x]), nullable=False, default=DatabaseStatus.available)
    subscription = Column(String, nullable=False)
    tags = Column(ARRAY(String), default=lambda: [])
    version = Column(String, nullable=True)
    azure_tenant = Column(String, nullable=True)
    
    # Additional detailed fields
    availability_zone = Column(String, nullable=True)
    auto_scaling = Column(String, nullable=True)
    iops = Column(String, nullable=True)
    high_availability_state = Column(String, nullable=True)
    replica = Column(String, nullable=True)
    backup_retention_days = Column(String, nullable=True)
    geo_redundant_backup = Column(String, nullable=True)

