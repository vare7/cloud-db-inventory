"""SQLAlchemy models for Azure VMs."""
from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum
import uuid
from .database import Base


class AzureVMModel(Base):
    """Model for Azure VM inventory."""
    __tablename__ = "azure_vms"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    computer_name = Column(String, nullable=True)
    private_ip_address = Column(String, nullable=True)
    subscription = Column(String, nullable=False)
    resource_group = Column(String, nullable=False)
    location = Column(String, nullable=False)
    vm_size = Column(String, nullable=False)
    os_type = Column(String, nullable=False)
    os_name = Column(String, nullable=True)
    os_version = Column(String, nullable=True)
    os_disk_size = Column(Integer, nullable=True)
    data_disk_count = Column(Integer, nullable=True)
    total_disk_size_gb = Column(Integer, nullable=True)
    display_status = Column(String, nullable=True)
    time_created = Column(DateTime, nullable=True)
    tenant_id = Column(String, nullable=True)
