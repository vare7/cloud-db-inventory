"""Tenant ID mapping utilities for Azure tenants."""

from sqlalchemy import Column, String, create_engine
from sqlalchemy.orm import Session
from .database import Base


class AzureTenantMapping(Base):
    """Mapping table for Azure tenant IDs to friendly names."""
    __tablename__ = "azure_tenant_mapping"

    tenant_id = Column(String, primary_key=True)
    friendly_name = Column(String, nullable=False)


# Predefined tenant mappings
TENANT_MAPPINGS = {
    "7df9d676-4a3e-4ff3-a54f-f30c0543fe4c": "TDH-Commercial",
    "c162a585-4fef-44bd-9271-d96409d0a349": "Corporate Tenant"
}


def init_tenant_mappings(db: Session) -> None:
    """Initialize tenant mappings in the database."""
    for tenant_id, friendly_name in TENANT_MAPPINGS.items():
        # Check if mapping already exists
        existing = db.query(AzureTenantMapping).filter(
            AzureTenantMapping.tenant_id == tenant_id
        ).first()
        
        if not existing:
            mapping = AzureTenantMapping(tenant_id=tenant_id, friendly_name=friendly_name)
            db.add(mapping)
    
    db.commit()


def get_tenant_name(db: Session, tenant_id: str) -> str:
    """Get friendly name for a tenant ID, or return the ID if not found."""
    if not tenant_id:
        return "-"
    
    mapping = db.query(AzureTenantMapping).filter(
        AzureTenantMapping.tenant_id == tenant_id
    ).first()
    
    return mapping.friendly_name if mapping else tenant_id
