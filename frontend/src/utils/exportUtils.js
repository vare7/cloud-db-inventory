/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = (data) => {
    if (data.length === 0)
        return "";
    // Define headers
    const headers = [
        "Provider",
        "Service",
        "Engine",
        "Version",
        "Region",
        "Endpoint",
        "Storage (GB)",
        "Status",
        "Subscription",
        "Tags",
        "Azure Tenant",
        "Availability Zone",
        "Auto Scaling",
        "IOPS",
        "High Availability",
        "Replica",
        "Backup Retention (Days)",
        "Geo-Redundant Backup"
    ];
    // Create CSV rows
    const rows = data.map(record => [
        record.provider,
        record.service,
        record.engine,
        record.version || "",
        record.region,
        record.endpoint,
        record.storage_gb,
        record.status,
        record.subscription,
        record.tags?.join("; ") || "",
        record.azure_tenant || "",
        record.availability_zone || "",
        record.auto_scaling || "",
        record.iops || "",
        record.high_availability_state || "",
        record.replica || "",
        record.backup_retention_days || "",
        record.geo_redundant_backup || ""
    ]);
    // Escape CSV values
    const escapeCSV = (value) => {
        const str = String(value ?? "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };
    // Build CSV string
    const csvContent = [
        headers.map(escapeCSV).join(","),
        ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");
    return csvContent;
};
/**
 * Download data as CSV file
 */
export const downloadCSV = (data, filename = "inventory-export.csv") => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
/**
 * Download data as Excel file (HTML table format with .xls extension)
 */
export const downloadExcel = (data, filename = "inventory-export.xls") => {
    if (data.length === 0)
        return;
    // Create HTML table
    const headers = [
        "Provider",
        "Service",
        "Engine",
        "Version",
        "Region",
        "Endpoint",
        "Storage (GB)",
        "Status",
        "Subscription",
        "Tags",
        "Azure Tenant",
        "Availability Zone",
        "Auto Scaling",
        "IOPS",
        "High Availability",
        "Replica",
        "Backup Retention (Days)",
        "Geo-Redundant Backup"
    ];
    const rows = data.map(record => [
        record.provider,
        record.service,
        record.engine,
        record.version || "",
        record.region,
        record.endpoint,
        record.storage_gb,
        record.status,
        record.subscription,
        record.tags?.join("; ") || "",
        record.azure_tenant || "",
        record.availability_zone || "",
        record.auto_scaling || "",
        record.iops || "",
        record.high_availability_state || "",
        record.replica || "",
        record.backup_retention_days || "",
        record.geo_redundant_backup || ""
    ]);
    // Build HTML table
    const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4CAF50; color: white; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${row.map(cell => `<td>${String(cell ?? "")}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;
    const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
