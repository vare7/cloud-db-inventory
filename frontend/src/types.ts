export type Provider = "AWS" | "Azure";
export type Status = "available" | "maintenance" | "warning";

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
}


