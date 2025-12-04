"""CSV parser for Azure VM data."""
import csv
from io import StringIO, BytesIO
from datetime import datetime
from typing import List, Tuple

from .schemas import AzureVMCreate


def parse_azure_vm_csv(file_content: bytes) -> Tuple[List[AzureVMCreate], List[dict]]:
    """Parse Azure VM CSV file.
    
    Returns:
        Tuple of (parsed_records, skipped_records)
    """
    parsed_records = []
    skipped_records = []

    try:
        text_content = file_content.decode('utf-8')
    except UnicodeDecodeError:
        text_content = file_content.decode('utf-8-sig')

    # Remove BOM if present
    if text_content.startswith('\ufeff'):
        text_content = text_content[1:]

    reader = csv.DictReader(StringIO(text_content))

    if not reader.fieldnames:
        return [], [{"error": "No headers found in CSV"}]

    for row_num, row in enumerate(reader, start=2):
        try:
            # Parse time_created if present
            time_created = None
            if row.get("timeCreated"):
                try:
                    time_created = datetime.fromisoformat(row["timeCreated"].replace("Z", "+00:00"))
                except (ValueError, AttributeError):
                    time_created = None

            # Parse integer fields
            os_disk_size = None
            if row.get("osDiskSize"):
                try:
                    os_disk_size = int(row["osDiskSize"])
                except (ValueError, TypeError):
                    pass

            data_disk_count = None
            if row.get("dataDiskCount"):
                try:
                    data_disk_count = int(row["dataDiskCount"])
                except (ValueError, TypeError):
                    pass

            total_disk_size_gb = None
            if row.get("totalDiskSizeGB"):
                try:
                    total_disk_size_gb = int(row["totalDiskSizeGB"])
                except (ValueError, TypeError):
                    pass

            record = AzureVMCreate(
                computer_name=row.get("computerName", "").strip(),
                private_ip_address=row.get("privateIPAddress", "").strip() or None,
                subscription=row.get("Subscription", "").strip(),
                resource_group=row.get("Resource group", "").strip(),
                location=row.get("Location", "").strip(),
                vm_size=row.get("vmSize", "").strip(),
                os_type=row.get("osType", "").strip(),
                os_name=row.get("osName", "").strip() or None,
                os_version=row.get("osVersion", "").strip() or None,
                os_disk_size=os_disk_size,
                data_disk_count=data_disk_count,
                total_disk_size_gb=total_disk_size_gb,
                display_status=row.get("displayStatus", "").strip() or None,
                time_created=time_created,
                tenant_id=row.get("tenantId", "").strip() or None,
            )
            parsed_records.append(record)
        except Exception as e:
            skipped_records.append({
                "row": row_num,
                "error": str(e),
                "data": dict(row)
            })

    return parsed_records, skipped_records
