-- Seed build catalog with database engine versions
-- This data is public information from official vendor sources

-- Connect to the cloud_db_inventory database
\c cloud_db_inventory

-- Create build_catalog table if not exists
CREATE TABLE IF NOT EXISTS build_catalog (
    id SERIAL PRIMARY KEY,
    engine VARCHAR(50) NOT NULL,
    version VARCHAR(100) NOT NULL,
    build_number VARCHAR(50) NOT NULL,
    release_date DATE NOT NULL,
    update_label VARCHAR(100),
    doc_label VARCHAR(100),
    doc_url TEXT,
    support_end DATE,
    maintenance_end DATE,
    UNIQUE(engine, version, build_number)
);

-- Insert SQL Server builds
INSERT INTO build_catalog (engine, version, build_number, release_date, update_label, doc_label, doc_url, support_end, maintenance_end)
VALUES
    ('SQL Server', 'SQL Server 2022', '16.0.4095.4', '2024-09-12', 'CU14', 'KB5038325', 'https://support.microsoft.com/en-us/help/5038325', '2028-01-11', '2033-01-11'),
    ('SQL Server', 'SQL Server 2022', '16.0.4085.2', '2024-08-14', 'CU13', 'KB5036432', 'https://support.microsoft.com/en-us/help/5036432', '2028-01-11', '2033-01-11'),
    ('SQL Server', 'SQL Server 2019', '15.0.4375.4', '2024-09-12', 'CU28', 'KB5038325', 'https://support.microsoft.com/en-us/help/5038325', '2025-02-28', '2030-01-08'),
    ('SQL Server', 'SQL Server 2017', '14.0.3465.1', '2024-01-11', 'CU31 GDR', 'KB5029376', 'https://support.microsoft.com/en-us/help/5029376', '2022-10-11', '2027-10-12'),
    ('SQL Server', 'SQL Server 2016', '13.0.7037.1', '2024-01-09', 'CU17 GDR', 'KB5029186', 'https://support.microsoft.com/en-us/help/5029186', '2021-07-13', '2026-07-14'),
    ('SQL Server', 'SQL Server 2014', '12.0.6449.1', '2024-02-13', 'CU4 GDR', 'KB5032968', 'https://support.microsoft.com/en-us/help/5032968', '2019-07-09', '2024-07-09')
ON CONFLICT (engine, version, build_number) DO NOTHING;

-- Insert PostgreSQL builds (sourced from endoflife.date)
INSERT INTO build_catalog (engine, version, build_number, release_date, update_label, doc_label, doc_url, support_end)
VALUES
    ('PostgreSQL', 'PostgreSQL 18', '18.1', '2025-11-10', '18.1', 'Release 18.1', 'https://www.postgresql.org/docs/release/18.1/', '2030-11-14'),
    ('PostgreSQL', 'PostgreSQL 17', '17.7', '2025-11-10', '17.7', 'Release 17.7', 'https://www.postgresql.org/docs/release/17.7/', '2029-11-08'),
    ('PostgreSQL', 'PostgreSQL 16', '16.11', '2025-11-10', '16.11', 'Release 16.11', 'https://www.postgresql.org/docs/release/16.11/', '2028-11-09'),
    ('PostgreSQL', 'PostgreSQL 15', '15.15', '2025-11-10', '15.15', 'Release 15.15', 'https://www.postgresql.org/docs/release/15.15/', '2027-11-11'),
    ('PostgreSQL', 'PostgreSQL 14', '14.20', '2025-11-10', '14.20', 'Release 14.20', 'https://www.postgresql.org/docs/release/14.20/', '2026-11-12'),
    ('PostgreSQL', 'PostgreSQL 13', '13.20', '2025-11-10', '13.20', 'Release 13.20', 'https://www.postgresql.org/docs/release/13.20/', '2025-11-13'),
    ('PostgreSQL', 'PostgreSQL 12', '12.23', '2025-11-10', '12.23', 'Release 12.23', 'https://www.postgresql.org/docs/release/12.23/', '2024-11-21'),
    ('PostgreSQL', 'PostgreSQL 11', '11.25', '2025-11-10', '11.25', 'Release 11.25', 'https://www.postgresql.org/docs/release/11.25/', '2023-11-09')
ON CONFLICT (engine, version, build_number) DO NOTHING;

-- Insert MySQL builds
INSERT INTO build_catalog (engine, version, build_number, release_date, update_label, doc_label, doc_url, support_end)
VALUES
    ('MySQL', 'MySQL 8.4 LTS', '8.4', '2024-04-30', '8.4 (LTS)', 'MySQL 8.4 LTS', 'https://docs.oracle.com/en-us/iaas/mysql-database/doc/mysql-server-versions.html#MYAAS-GUID-BA832E37-B752-42AA-890A-2ACAD44B2F6C', '2032-04-30'),
    ('MySQL', 'MySQL 8.0', '8.0', '2018-04-19', '8.0 (GA)', 'MySQL 8.0 GA', 'https://docs.oracle.com/en-us/iaas/mysql-database/doc/mysql-server-versions.html#MYAAS-GUID-BA832E37-B752-42AA-890A-2ACAD44B2F6C', '2026-04-30'),
    ('MySQL', 'MySQL 5.7', '5.7', '2015-10-21', '5.7 (GA)', 'MySQL 5.7 GA', 'https://docs.oracle.com/en-us/iaas/mysql-database/doc/mysql-server-versions.html#MYAAS-GUID-BA832E37-B752-42AA-890A-2ACAD44B2F6C', '2023-10-31')
ON CONFLICT (engine, version, build_number) DO NOTHING;

-- Insert MongoDB builds (sourced from https://www.mongodb.com/legal/support-policy/lifecycles)
INSERT INTO build_catalog (engine, version, build_number, release_date, update_label, doc_label, doc_url, support_end)
VALUES
    ('MongoDB', 'MongoDB 8.0', '8.0', '2024-11-12', '8.0 GA', 'MongoDB 8.0', 'https://www.mongodb.com/docs/manual/release-notes/8.0/', '2029-10-31'),
    ('MongoDB', 'MongoDB 7.0', '7.0', '2023-08-08', '7.0 GA', 'MongoDB 7.0', 'https://www.mongodb.com/docs/manual/release-notes/7.0/', '2027-08-31')
ON CONFLICT (engine, version, build_number) DO NOTHING;
