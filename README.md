# Cloud DB Inventory

A comprehensive cloud database inventory management system for tracking and managing database resources across AWS and Azure environments.

## Overview

**Cloud DB Inventory** is a full-stack web application designed to help organizations maintain a centralized inventory of their cloud database resources. It provides real-time visibility into database deployments, enables bulk imports from cloud exports, tracks version compliance, and identifies databases requiring upgrades.

### Purpose

- **Centralized Visibility**: Single pane of glass for all database resources across AWS and Azure
- **Compliance Tracking**: Monitor database versions and identify resources needing upgrades
- **Capacity Planning**: Track storage usage and growth trends across your database fleet
- **Cost Optimization**: Identify duplicate resources and optimize database deployments
- **Audit & Reporting**: Maintain historical records of database inventory with CSV import/export

### Key Capabilities

1. **Multi-Cloud Support**: Seamlessly manage AWS RDS, Aurora, and Azure SQL databases in one interface
2. **CSV Import/Export**: Bulk import database inventories from AWS/Azure exports
3. **Duplicate Detection**: Automatically identify and resolve duplicate database entries
4. **Version Tracking**: Monitor database engine versions and flag resources below compliance thresholds
5. **Advanced Filtering**: Search and filter by provider, region, engine type, version, and subscription
6. **Analytics Dashboard**: Visualize fleet health, capacity metrics, and version distribution
7. **Upgrade Planning**: Dedicated view for databases requiring version updates

## Stack

- **Backend**: FastAPI + Uvicorn, PostgreSQL with SQLAlchemy ORM
- **Frontend**: React (Vite + TypeScript) with Material UI

## Getting started

### Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+ (running locally or accessible)

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb cloud_db_inventory
# Or using psql:
# psql -U postgres
# CREATE DATABASE cloud_db_inventory;
```

2. Configure database connection:
```bash
cd backend
cp .env.example .env
# Edit .env and set your DATABASE_URL:
# DATABASE_URL=postgresql://username:password@localhost:5432/cloud_db_inventory
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API listens on `http://localhost:8000`. The database tables will be created automatically on first startup.

### Frontend

Install Node.js 18+ first. Then:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` to the FastAPI backend.

## Generating CSV Data for Import

### Azure (Using Azure Resource Graph)

Use the following KQL query in Azure Resource Graph Explorer to generate a CSV export of your Azure database resources:

```kql
//Purpose
//Retrieve inventory and configuration details of:
//Azure Database for PostgreSQL Flex server
//Azure Database for MySQL Flex server
//Azure Arc-enabled SQL Server instances 
// Click the "Run query" command above to execute the query and see results.
resources
| where type =~ "microsoft.dbforpostgresql/flexibleservers"
   or type =~ "microsoft.dbformysql/flexibleservers"
   or type =~ "microsoft.azurearcdata/sqlserverinstances"
| extend DB_Type = case(
    type has "dbforpostgresql", "PostgreSQL",
    type has "dbformysql", "MySQL",
    type has "sqlserverinstances", "SQL Server (Arc)",
    "Other"
)
| project
    name,
    DB_Type,
    resourceGroup,
    subscriptionId,
    location,
    State = tostring(properties.state),
    dbVersion = tostring(properties.version),
    StorageGB = tostring(properties.storage.storageSizeGB),
    AvailabilityZone = tostring(properties.availabilityZone),
    AutoGrow = tostring(properties.storage.autoGrow),
    AutoIoScaling = tostring(properties.storage.autoIoScaling),
    IOPS = tostring(properties.storage.iops),
    FQDN = tostring(properties.fullyQualifiedDomainName),
    HighAvailabilityState = tostring(properties.highAvailability.state),
    HighAvailabilityMode = tostring(properties.highAvailability.mode),
    Replica = tostring(properties.replicationRole),
    BackupRetentionDays = tostring(properties.backup.backupRetentionDays),
    GeoRedundantBackup = tostring(properties.backup.geoRedundantBackup),
    tenantId
```

**Steps to Export:**
1. Navigate to [Azure Resource Graph Explorer](https://portal.azure.com/#view/HubsExtension/ArgQueryBlade)
2. Paste the KQL query above
3. Click "Run query"
4. Click "Download as CSV"
5. Import the CSV file in the Cloud DB Inventory application

The query is also available in [`azure-kql-query.txt`](azure-kql-query.txt).

### AWS

For AWS RDS and Aurora instances, use AWS CLI or console to export your database inventory:

```bash
# Using AWS CLI
aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,Engine,EngineVersion,DBInstanceStatus,AvailabilityZone,Endpoint.Address,AllocatedStorage]' --output table

# Export to CSV (requires jq)
aws rds describe-db-instances | jq -r '.DBInstances[] | [.DBInstanceIdentifier, .Engine, .EngineVersion, .DBInstanceStatus, .AvailabilityZone, .Endpoint.Address, .AllocatedStorage] | @csv' > aws-rds-export.csv
```

Or use the AWS Console:
1. Navigate to RDS Dashboard
2. Select all database instances
3. Use AWS Config or custom script to export details

## API overview

- `GET /api/databases`: List with optional `provider`, `status`, `region`, `search`
- `POST /api/databases`: Create new database entry
- `GET /api/databases/{id}`: Fetch single record
- `PATCH /api/databases/{id}/status?status=available`: Update status flag
- `GET /api/stats`: Aggregate counts for dashboard cards
- `POST /api/databases/import-csv`: Import database inventory from CSV file (AWS or Azure)

## Data Storage

All data is stored in PostgreSQL. CSV imports and manual entries persist across server restarts. The database schema is automatically created on first startup.

## Frontend highlights

- Stat cards for fleet health and capacity
- Filter/search toolbar with instant fetch
- Inventory table with status chips and tag pills
- Drawer to add new resources without leaving dashboard
- Dashboard with metrics and analytics charts
- Upgrades tab for tracking databases needing version updates
- CSV import/export with duplicate detection
- Resizable columns and pagination

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete guide for deploying to a new VM or server
- **[GIT_SETUP.md](GIT_SETUP.md)** - Complete guide for uploading to Git repositories (GitHub, GitLab, Azure DevOps)
- **[OPERATIONS.md](OPERATIONS.md)** - Operational guide for starting, stopping, and managing the application
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guidelines for contributing to the project

## Features

### Core Functionality
- ✅ Multi-cloud inventory management (AWS & Azure)
- ✅ CSV import with validation and duplicate detection
- ✅ Advanced filtering (Provider, Region, Engine, Version, Subscription)
- ✅ Real-time search across all fields
- ✅ CRUD operations with confirmation dialogs
- ✅ Resizable columns for customized views

### Analytics & Insights
- ✅ Dashboard with key metrics and charts
- ✅ Upgrades tracking with version thresholds
- ✅ Database health statistics
- ✅ Capacity planning metrics

### Data Management
- ✅ Duplicate detection and cleanup
- ✅ CSV-based data synchronization
- ✅ Version comparison and filtering
- ✅ Major version grouping

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review closed issues for solutions


