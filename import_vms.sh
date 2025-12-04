#!/bin/bash
cd /c/Users/vare/Documents/gitrepos/cloud-db-inventory
curl -X POST -F "file=@backend/tests/data/CorpTenantVMInventory.csv" http://localhost:8000/api/azure-vms/import-csv
