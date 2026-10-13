-- ============================================================================
-- Enterprise Asset Management - Mock & Seed Data
-- ============================================================================

BEGIN;

-- 1. Asset Categories
INSERT INTO asset_categories (id, code, name, description) VALUES
('c0000000-0000-0000-0000-000000000001', 'LAPTOP', 'Laptop & PC', 'Komputer jinjing, desktop PC, workstation, dan periferal komputasi'),
('c0000000-0000-0000-0000-000000000002', 'SERVER', 'Server & Network', 'Server rak, switch, router, access point, dan firewall'),
('c0000000-0000-0000-0000-000000000003', 'VEHICLE', 'Kendaraan Operasional', 'Mobil dinas operasional, truk angkut, forklift, dan motor kurir'),
('c0000000-0000-0000-0000-000000000004', 'MACHINE', 'Mesin Pabrik', 'Mesin genset, kompresor angin, CNC, dan peralatan industri'),
('c0000000-0000-0000-0000-000000000005', 'FURNITURE', 'Furnitur Kantor', 'Meja kerja ergonomis, kursi eksekutif, lemari arsip, dan partisi')
ON CONFLICT (code) DO NOTHING;

-- 2. Maintenance Categories
INSERT INTO maintenance_categories (id, code, name, default_interval_days, is_capitalized, description) VALUES
('a0000000-0000-0000-0000-000000000001', 'ROUTINE', 'Servis Berkala & Tune Up', 90, FALSE, 'Pembersihan fisik, penggantian oli, dan kalibrasi rutin'),
('a0000000-0000-0000-0000-000000000002', 'REPAIR', 'Perbaikan Kerusakan', 0, FALSE, 'Penggantian spare part rusak dan perbaikan mendesak'),
('a0000000-0000-0000-0000-000000000003', 'UPGRADE', 'Upgrade Kapasitas / Komponen', 365, TRUE, 'Penambahan RAM, modul SSD, atau modul daya server'),
('a0000000-0000-0000-0000-000000000004', 'CALIBRATE', 'Kalibrasi & Pengujian Keamanan', 180, FALSE, 'Pengujian beban mesin dan kepatuhan standar K3')
ON CONFLICT (code) DO NOTHING;

-- 3. Departments
INSERT INTO departments (id, code, name) VALUES
('d0000000-0000-0000-0000-000000000001', 'DEPT-IT', 'IT & Digital Transformation'),
('d0000000-0000-0000-0000-000000000002', 'DEPT-OPS', 'Operations & Logistics'),
('d0000000-0000-0000-0000-000000000003', 'DEPT-ENG', 'Field Engineering & Plant'),
('d0000000-0000-0000-0000-000000000004', 'DEPT-FIN', 'Finance & Accounting'),
('d0000000-0000-0000-0000-000000000005', 'DEPT-GA', 'General Affairs & Facilities')
ON CONFLICT (code) DO NOTHING;

-- 4. Locations
INSERT INTO locations (id, code, building, floor, room, address) VALUES
('b0000000-0000-0000-0000-000000000001', 'LOC-HQ-101', 'Kantor Pusat Sudirman', 'Lantai 1', 'Ruang IT Ops & NOC', 'Jl. Jendral Sudirman Kav. 25, Jakarta Selatan'),
('b0000000-0000-0000-0000-000000000002', 'LOC-HQ-302', 'Kantor Pusat Sudirman', 'Lantai 3', 'Ruang Kerja Eksekutif', 'Jl. Jendral Sudirman Kav. 25, Jakarta Selatan'),
('b0000000-0000-0000-0000-000000000003', 'LOC-DC-001', 'Data Center Cikarang', 'Lantai 1', 'Server Hall Rack Alpha', 'Kawasan Industri GIIC Cikarang, Bekasi'),
('b0000000-0000-0000-0000-000000000004', 'LOC-PLT-02', 'Pabrik Karawang Plant 2', 'Lantai Dasar', 'Bengkel & Ruang Genset', 'Kawasan Surya Cipta Karawang'),
('b0000000-0000-0000-0000-000000000005', 'LOC-LOG-01', 'Gudang Logistik Marunda', 'Lantai 1', 'Staging Area Armada', 'Jl. Raya Marunda No. 88, Jakarta Utara')
ON CONFLICT (code) DO NOTHING;

-- 5. Vendors
INSERT INTO vendors (id, name, contact_name, phone, email, address) VALUES
('e0000000-0000-0000-0000-000000000001', 'PT Synnex Metrodata Indonesia', 'Hendra Setiawan', '021-29345800', 'corporate@metrodata.co.id', 'APL Tower Lt. 42, Grogol, Jakarta Barat'),
('e0000000-0000-0000-0000-000000000002', 'PT Dell Technologies Indonesia', 'Maya Anggraini', '021-50882000', 'enterprise.sales@dell.com', 'Menara BCA Lt. 35, Grand Indonesia, Jakarta'),
('e0000000-0000-0000-0000-000000000003', 'PT Toyota Astra Motor', 'Bambang Supriyadi', '021-6515551', 'fleet@toyota.astra.co.id', 'Jl. Laksda Yos Sudarso, Sunter II, Jakarta Utara'),
('e0000000-0000-0000-0000-000000000004', 'PT Cummins Indonesia', 'Wahyudi Prasetyo', '021-8935100', 'industrial.support@cummins.co.id', 'Jababeka Industrial Estate, Cikarang'),
('e0000000-0000-0000-0000-000000000005', 'PT Informa Furnishings Mandiri', 'Lina Marlina', '021-5829000', 'b2b@informa.co.id', 'Gedung Kawan Lama Lt. 5, Puri Kencana, Jakarta')
ON CONFLICT (id) DO NOTHING;

-- 6. Employees
INSERT INTO employees (id, department_id, nip, full_name, job_title, email, phone, status) VALUES
('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'EMP-2023-001', 'Budi Santoso', 'Lead Infrastructure Engineer', 'budi.santoso@enterprise.corp', '081289001122', 'active'),
('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'EMP-2023-014', 'Rina Kusuma', 'Senior UI/UX & Product Designer', 'rina.kusuma@enterprise.corp', '081399887766', 'active'),
('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'EMP-2022-045', 'Data Center Operator', 'Site Operations Specialist', 'noc.operator@enterprise.corp', '081122334455', 'active'),
('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000003', 'EMP-2021-089', 'Andi Wijaya', 'Field Technical Supervisor', 'andi.wijaya@enterprise.corp', '081566778899', 'active'),
('f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 'EMP-2020-012', 'Facility Management Team', 'Facility Coordinator', 'facility.ga@enterprise.corp', '081677889900', 'active'),
('f0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000004', 'EMP-2022-033', 'Dewi Lestari', 'Finance Controller', 'dewi.lestari@enterprise.corp', '081233445566', 'active')
ON CONFLICT (nip) DO NOTHING;

-- 7. Assets
INSERT INTO assets (
  id, asset_code, barcode, serial_number, name, brand, model, condition,
  category_id, vendor_id, location_id, assigned_to,
  status, purchase_date, purchase_cost, useful_life_years, salvage_value, specifications, notes
) VALUES
('10000000-0000-0000-0000-000000000001', 'AST-IT-2026-089', 'BC-IT-089', 'SN-TP-T14-99812', 'Lenovo ThinkPad T14 Gen 4', 'Lenovo', 'ThinkPad T14 Gen 4', 'good', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'in_use', CURRENT_DATE - INTERVAL '120 days', 24500000, 4, 2000000, '{"processor":"Intel Core i7-1370P","ram":"32GB DDR5","storage":"1TB NVMe PCIe 4.0"}', 'Laptop utama Tech Lead'),
('10000000-0000-0000-0000-000000000002', 'AST-SRV-2026-012', 'BC-SRV-012', 'SN-DELL-R750-4410', 'Dell PowerEdge R750 Server', 'Dell', 'PowerEdge R750', 'good', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003', 'in_use', CURRENT_DATE - INTERVAL '95 days', 145000000, 5, 10000000, '{"processor":"Dual Intel Xeon Gold 6330","ram":"128GB ECC RDIMM","storage":"8x 2TB SAS 12Gbps RAID10"}', 'Node Database Produksi'),
('10000000-0000-0000-0000-000000000003', 'AST-VH-2026-004', 'BC-VH-004', 'SN-TYT-HLX-77889', 'Toyota Hilux 4x4 Double Cabin', 'Toyota', 'Hilux Double Cabin 4x4', 'fair', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000004', 'maintenance', CURRENT_DATE - INTERVAL '70 days', 480000000, 8, 80000000, '{"engine":"2.4L Diesel Turbo","transmission":"Manual 6-Speed","plat":"B 1234 XYZ"}', 'Armada survei lapangan plant'),
('10000000-0000-0000-0000-000000000004', 'AST-IT-2026-092', 'BC-IT-092', 'SN-APL-MBP16-0012', 'Apple MacBook Pro 16" M3 Max', 'Apple', 'MacBook Pro 16" M3 Max', 'new', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 'in_use', CURRENT_DATE - INTERVAL '55 days', 58000000, 4, 8000000, '{"processor":"Apple M3 Max (16-core CPU, 40-core GPU)","ram":"48GB Unified","storage":"1TB SSD"}', 'Workstation UI/UX Designer'),
('10000000-0000-0000-0000-000000000005', 'AST-EQ-2026-031', 'BC-EQ-031', 'SN-CMS-250KVA-88', 'Genset Silent Cummins 250 kVA', 'Cummins', 'Silent Genset 250 kVA', 'good', 'c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', NULL, 'available', CURRENT_DATE - INTERVAL '45 days', 320000000, 10, 30000000, '{"model":"C275D5B","voltage":"400/230V","frequency":"50Hz"}', 'Genset cadangan Pabrik Karawang 2'),
('10000000-0000-0000-0000-000000000006', 'AST-IT-2026-101', 'BC-IT-101', 'SN-DELL-LAT-5440', 'Dell Latitude 5440 Core i5', 'Dell', 'Latitude 5440', 'good', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000006', 'in_use', CURRENT_DATE - INTERVAL '35 days', 18500000, 4, 1500000, '{"processor":"Intel Core i5-1345U","ram":"16GB DDR5","storage":"512GB NVMe"}', 'Laptop operasional Finance'),
('10000000-0000-0000-0000-000000000007', 'AST-SRV-2026-015', 'BC-SRV-015', 'SN-CSCO-C9300-48P', 'Cisco Catalyst 9300 48-Port PoE+', 'Cisco', 'Catalyst 9300 Switch', 'good', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', NULL, 'available', CURRENT_DATE - INTERVAL '25 days', 85000000, 7, 5000000, '{"ports":"48x 1G PoE+","uplinks":"4x 10G SFP+","switching_capacity":"256 Gbps"}', 'Switch distribusi Data Center'),
('10000000-0000-0000-0000-000000000008', 'AST-VH-2026-008', 'BC-VH-008', 'SN-MTS-FUSO-3321', 'Mitsubishi Fuso Canter FE 74 HD', 'Mitsubishi', 'Fuso Canter FE 74 HD', 'damaged', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', NULL, 'maintenance', CURRENT_DATE - INTERVAL '15 days', 410000000, 7, 50000000, '{"payload":"5 Ton","engine":"4V21-2AT4 136PS"}', 'Truk logistik antarkota'),
('10000000-0000-0000-0000-000000000009', 'AST-FN-2026-044', 'BC-FN-044', 'SN-HM-AERON-019', 'Herman Miller Aeron Chair Ergonomic', 'Herman Miller', 'Aeron Ergonomic Chair', 'good', 'c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', NULL, 'available', CURRENT_DATE - INTERVAL '8 days', 23500000, 10, 2000000, '{"size":"Size B","features":"PostureFit SL, Fully Adjustable Arms"}', 'Kursi ruang rapat direksi'),
('10000000-0000-0000-0000-000000000010', 'AST-EQ-2026-045', 'BC-EQ-045', 'SN-ATLAS-GA37-99', 'Atlas Copco Rotary Screw Compressor 37kW', 'Atlas Copco', 'Rotary Screw Compressor 37kW', 'good', 'c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', NULL, 'available', CURRENT_DATE - INTERVAL '3 days', 265000000, 10, 25000000, '{"power":"37 kW","capacity":"6.2 m3/min","pressure":"8.5 bar"}', 'Kompresor udara lini produksi Karawang')
ON CONFLICT (asset_code) DO NOTHING;

-- 8. Computer Specifications
INSERT INTO computer_specifications (
  asset_id, computer_name, ip_address, ms_office_version, os_name,
  processor_detail, cpu_family, ram_capacity_gb, storage_detail
) VALUES
('10000000-0000-0000-0000-000000000001', 'NB-IT-BSANTOSO', '192.168.10.155', 'Office 365 E5', 'Windows 11 Pro 64-bit', 'Intel Core i7-1370P vPro (14 Cores / 20 Threads)', 'Intel Core i7', 32, '1TB NVMe PCIe Gen4 M.2 SSD'),
('10000000-0000-0000-0000-000000000002', 'SRV-PROD-DB01', '10.100.20.10', 'None', 'Ubuntu Server 24.04 LTS', 'Dual Intel Xeon Gold 6330 (56 vCPU, 2.0GHz)', 'Intel Xeon', 128, '8x 2TB SAS 12Gbps RAID10 (7.2TB usable)'),
('10000000-0000-0000-0000-000000000004', 'MBP-DES-RKUSUMA', '192.168.10.180', 'Office for Mac 2024', 'macOS Sequoia 15.2', 'Apple M3 Max (16-core CPU, 40-core GPU)', 'Apple Silicon M3', 48, '1TB Apple PCIe Gen4 SSD'),
('10000000-0000-0000-0000-000000000006', 'NB-FIN-DLESTARI', '192.168.20.45', 'Office 365 E3', 'Windows 11 Pro 64-bit', 'Intel Core i5-1345U (10 Cores / 12 Threads)', 'Intel Core i5', 16, '512GB NVMe PCIe Gen4 M.2 SSD')
ON CONFLICT (asset_id) DO NOTHING;

-- 9. Asset Maintenances
INSERT INTO asset_maintenances (
  id, asset_id, category_id, vendor_id, status, scheduled_date, completed_date, cost, performed_by, description
) VALUES
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'completed', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '59 days', 1200000, 'Synnex Service Care', 'Pembersihan heatsink thermal paste dan battery health diagnostic'),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 'completed', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '39 days', 22000000, 'Dell Enterprise Certified Support', 'Pemasangan ekspansi modul RAM ECC 64GB dan firmware BIOS update'),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'in_progress', CURRENT_DATE - INTERVAL '20 days', NULL, 12500000, 'Bengkel Resmi Auto2000', 'Ganti timing belt, kampas rem, servis suspensi depan, dan tune up mesin'),
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 'scheduled', CURRENT_DATE - INTERVAL '10 days', NULL, 18700000, 'Krama Yudha Tiga Berlian', 'Overhaul sistem injeksi bahan bakar dan perbaikan rem pneumatik')
ON CONFLICT (id) DO NOTHING;

COMMIT;
