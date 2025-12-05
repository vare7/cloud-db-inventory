export type Provider = "AWS" | "Azure";
export type Status = "available" | "ready" | "stopped" | "maintenance" | "warning";

export interface DatabaseRecord {
  id: string;
  provider: Provider;
  service: string;
  engine: string;
  region: string;
  endpoint: string;
  storage_gb: number;
  status: Status;
  subscription: string;
  tags: string[];
  version?: string | null;
  azure_tenant?: string | null;
  availability_zone?: string | null;
  auto_scaling?: string | null;
  iops?: string | null;
  high_availability_state?: string | null;
  replica?: string | null;
  backup_retention_days?: string | null;
  geo_redundant_backup?: string | null;
}

export interface AzureVM {
  id: string;
  computer_name: string;
  private_ip_address?: string | null;
  subscription: string;
  resource_group: string;
  location: string;
  vm_size: string;
  os_type: string;
  os_name?: string | null;
  os_version?: string | null;
  os_disk_size?: number | null;
  data_disk_count?: number | null;
  total_disk_size_gb?: number | null;
  display_status?: string | null;
  time_created?: string | null;
  tenant_id?: string | null;
}

export interface StatsSummary {
  total: number;
  storage_gb_total: number;
  by_provider: Record<Provider, number>;
  by_status: Record<Status, number>;
}

export interface InventoryFilters {
  provider?: Provider | "";
  status?: Status | "";
  region?: string;
  engine?: string;
  version?: string;
  subscription?: string;
  search?: string;
  excludeStopped?: boolean;
}


