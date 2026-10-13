BEGIN;

-- ============================================================================
-- 1. MASTER DATA TABLES
-- ============================================================================

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(20),
    room VARCHAR(50) NOT NULL,
    address TEXT,
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_building_floor_room UNIQUE (building, floor, room)
);

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    nip VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    nik VARCHAR(100) UNIQUE,
    gender VARCHAR(20),
    birth_date DATE,
    hire_date DATE,
    job_title VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(100) UNIQUE NOT NULL,
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(100),
    address TEXT,
    description TEXT,
    website VARCHAR(100),
    notes TEXT,    
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE asset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE maintenance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    default_interval_days INT,
    is_capitalized BOOLEAN DEFAULT FALSE,
    description TEXT,
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'user',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    phone VARCHAR(30),
    avatar_url TEXT,
    theme_color VARCHAR(30) DEFAULT 'zinc' NOT NULL,
    theme_radius VARCHAR(10) DEFAULT '0.625' NOT NULL,
    theme_mode VARCHAR(20) DEFAULT 'system' NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_users_role CHECK (role IN ('superadmin', 'admin', 'staff', 'technician', 'user', 'viewer')),
    CONSTRAINT chk_users_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Foreign Key Constraints ke tabel users untuk Master Data
ALTER TABLE departments
    ADD CONSTRAINT fk_departments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_departments_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_departments_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE locations
    ADD CONSTRAINT fk_locations_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_locations_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_locations_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE employees
    ADD CONSTRAINT fk_employees_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_employees_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_employees_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE vendors
    ADD CONSTRAINT fk_vendors_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_vendors_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_vendors_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE asset_categories
    ADD CONSTRAINT fk_asset_categories_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_asset_categories_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_asset_categories_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE maintenance_categories
    ADD CONSTRAINT fk_maintenance_categories_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_maintenance_categories_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_maintenance_categories_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- 2. ASSET CORE & TRANSACTION TABLES
-- ============================================================================

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    serial_number VARCHAR(100) UNIQUE,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    category_id UUID NOT NULL REFERENCES asset_categories(id),
    vendor_id UUID REFERENCES vendors(id),
    location_id UUID REFERENCES locations(id),
    assigned_to UUID REFERENCES employees(id),
    status VARCHAR(30) NOT NULL DEFAULT 'available',
    condition VARCHAR(30) NOT NULL DEFAULT 'good',
    image_url TEXT,
    
    purchase_date DATE NOT NULL,
    purchase_cost NUMERIC(15, 2) NOT NULL,
    warranty_expiry DATE,
    depreciation_method VARCHAR(50) DEFAULT 'straight_line',
    useful_life_years INT DEFAULT 5,
    salvage_value NUMERIC(15, 2) DEFAULT 0,
    
    specifications JSONB,
    notes TEXT,
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_assets_status CHECK (status IN ('available', 'in_use', 'maintenance', 'damaged', 'disposed', 'backup', 'reserved')),
    CONSTRAINT chk_assets_condition CHECK (condition IN ('new', 'good', 'fair', 'poor', 'damaged'))
);

-- Tabel Khusus Spesifikasi IT / Komputer
CREATE TABLE computer_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID UNIQUE NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    computer_name VARCHAR(50) UNIQUE,
    ip_address INET,
    ms_office_version VARCHAR(50),
    os_name VARCHAR(100),
    processor_detail VARCHAR(150),
    cpu_family VARCHAR(50),
    ram_capacity_gb INT,
    storage_detail VARCHAR(150),
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE asset_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    location_id UUID REFERENCES locations(id),
    document_number VARCHAR(100),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expected_return_date DATE,
    returned_at TIMESTAMP WITH TIME ZONE,
    condition_on_checkout TEXT,
    condition_on_return TEXT,
    notes TEXT,
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE asset_maintenances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    category_id UUID REFERENCES maintenance_categories(id),
    vendor_id UUID REFERENCES vendors(id),
    status VARCHAR(30) DEFAULT 'scheduled' NOT NULL,
    scheduled_date DATE,
    completed_date DATE,
    cost NUMERIC(15, 2) DEFAULT 0,
    performed_by VARCHAR(100),
    invoice_number VARCHAR(100),
    description TEXT NOT NULL,
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_maintenances_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

-- Sesi Audit Opname
CREATE TABLE asset_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_code VARCHAR(50) UNIQUE NOT NULL,  -- Contoh: AUD-2026-Q4
    title VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(30) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'canceled'
    lead_auditor_id UUID REFERENCES employees(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Detail Hasil Scan Tiap Aset Saat Audit
CREATE TABLE asset_audit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES asset_audits(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scanned_by UUID REFERENCES employees(id),
    
    -- Kondisi temuannya
    expected_location_id UUID REFERENCES locations(id),
    actual_location_id UUID REFERENCES locations(id),
    expected_employee_id UUID REFERENCES employees(id),
    actual_employee_id UUID REFERENCES employees(id),
    status_found VARCHAR(30) NOT NULL,        -- 'match', 'misplaced', 'missing', 'damaged'
    notes TEXT
);

CREATE TABLE software_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    license_key TEXT,
    seats_total INT DEFAULT 1,
    seats_used INT DEFAULT 0,
    vendor_id UUID REFERENCES vendors(id),
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_license_seats CHECK (seats_used <= seats_total)
);

CREATE TABLE asset_software_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    license_id UUID NOT NULL REFERENCES software_licenses(id) ON DELETE CASCADE,
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    provider_name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    coverage_details TEXT,
    premium_amount NUMERIC(15, 2)
);

CREATE TABLE asset_insurances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES insurance_policies(id),
    insured_value NUMERIC(15, 2) NOT NULL
);

CREATE TABLE asset_depreciations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    depreciation_amount NUMERIC(15, 2) NOT NULL,
    book_value NUMERIC(15, 2) NOT NULL,
    
    -- Audit Metadata (Immutable Ledger)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE asset_disposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    disposal_date DATE NOT NULL,
    reason VARCHAR(50) NOT NULL,
    sale_price NUMERIC(15, 2) DEFAULT 0,
    approved_by UUID REFERENCES employees(id),
    notes TEXT,
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE asset_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    attachment_type VARCHAR(50),
    uploaded_by UUID REFERENCES employees(id),
    
    -- Audit Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE asset_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    old_assigned_to UUID REFERENCES employees(id),
    new_assigned_to UUID REFERENCES employees(id),
    old_location_id UUID REFERENCES locations(id),
    new_location_id UUID REFERENCES locations(id),
    reference_table VARCHAR(50),
    reference_id UUID,
    details JSONB,
    performed_by UUID REFERENCES employees(id),
    performed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- Log Aktivitas Pengguna Terpusat (User Activity & System Audit Logs)
-- ============================================================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_departments_is_deleted ON departments(is_deleted) WHERE is_deleted = FALSE;

CREATE INDEX idx_locations_is_deleted ON locations(is_deleted) WHERE is_deleted = FALSE;

CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_is_deleted ON employees(is_deleted) WHERE is_deleted = FALSE;

CREATE INDEX idx_vendors_is_deleted ON vendors(is_deleted) WHERE is_deleted = FALSE;

CREATE INDEX idx_asset_categories_is_deleted ON asset_categories(is_deleted) WHERE is_deleted = FALSE;

CREATE INDEX idx_maintenance_categories_is_deleted ON maintenance_categories(is_deleted) WHERE is_deleted = FALSE;

CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_is_deleted ON users(is_deleted) WHERE is_deleted = FALSE;

CREATE INDEX idx_assets_parent_id ON assets(parent_asset_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category_id ON assets(category_id);
CREATE INDEX idx_assets_assigned_to ON assets(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_assets_location_id ON assets(location_id);
CREATE INDEX idx_assets_specifications ON assets USING GIN (specifications);
CREATE INDEX idx_assets_is_deleted ON assets(is_deleted) WHERE is_deleted = FALSE;

CREATE INDEX idx_computer_specs_ip ON computer_specifications(ip_address);
CREATE INDEX idx_computer_specs_name ON computer_specifications(computer_name);

CREATE INDEX idx_asset_assignments_active ON asset_assignments(asset_id, employee_id) WHERE returned_at IS NULL;
-- Rec: tolak double checkout di level database (satu aset aktif hanya untuk satu karyawan)
CREATE UNIQUE INDEX uq_active_asset_assignment ON asset_assignments(asset_id) WHERE returned_at IS NULL;
CREATE INDEX idx_asset_maintenances_asset_date ON asset_maintenances(asset_id, scheduled_date);
CREATE INDEX idx_asset_depreciations_asset_period ON asset_depreciations(asset_id, period_date DESC);
CREATE INDEX idx_asset_attachments_is_deleted ON asset_attachments(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX idx_asset_histories_asset_id ON asset_histories(asset_id, created_at DESC);
CREATE INDEX idx_asset_histories_action_type ON asset_histories(action_type);

CREATE INDEX idx_assets_barcode ON assets(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_assets_brand ON assets(brand) WHERE brand IS NOT NULL;
CREATE INDEX idx_assets_condition ON assets(condition);
CREATE INDEX idx_asset_assignments_employee_id ON asset_assignments(employee_id);
CREATE INDEX idx_asset_maintenances_status ON asset_maintenances(status);
CREATE INDEX idx_asset_maintenances_vendor_id ON asset_maintenances(vendor_id);
CREATE INDEX idx_asset_audits_status ON asset_audits(status);
CREATE INDEX idx_software_licenses_vendor_id ON software_licenses(vendor_id);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================================
-- 4. TRIGGER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Generic Auto Update Timestamp Trigger Function
CREATE OR REPLACE FUNCTION trg_fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_departments_set_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_updated_at();

CREATE TRIGGER trg_locations_set_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_updated_at();

CREATE TRIGGER trg_employees_set_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_updated_at();

CREATE TRIGGER trg_vendors_set_updated_at
BEFORE UPDATE ON vendors
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_updated_at();

CREATE TRIGGER trg_asset_categories_set_updated_at
BEFORE UPDATE ON asset_categories
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_updated_at();

CREATE TRIGGER trg_maintenance_categories_set_updated_at
BEFORE UPDATE ON maintenance_categories
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_updated_at();

CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_updated_at();

CREATE TRIGGER trg_assets_set_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_updated_at();

CREATE TRIGGER trg_computer_specs_set_updated_at
BEFORE UPDATE ON computer_specifications
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_updated_at();

CREATE TRIGGER trg_asset_assignments_set_updated_at
BEFORE UPDATE ON asset_assignments
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_updated_at();

CREATE TRIGGER trg_asset_maintenances_set_updated_at
BEFORE UPDATE ON asset_maintenances
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_updated_at();

CREATE TRIGGER trg_asset_disposals_set_updated_at
BEFORE UPDATE ON asset_disposals
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_updated_at();

-- Assignment Status Sync Trigger Function
CREATE OR REPLACE FUNCTION trg_fn_sync_asset_assignment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.returned_at IS NULL THEN
        UPDATE assets
        SET 
            status = 'in_use',
            assigned_to = NEW.employee_id,
            location_id = COALESCE(NEW.location_id, location_id)
        WHERE id = NEW.asset_id;

    ELSIF TG_OP = 'UPDATE' AND OLD.returned_at IS NULL AND NEW.returned_at IS NOT NULL THEN
        UPDATE assets
        SET 
            status = 'available',
            assigned_to = NULL
        WHERE id = NEW.asset_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_asset_assignment
AFTER INSERT OR UPDATE ON asset_assignments
FOR EACH ROW
EXECUTE FUNCTION trg_fn_sync_asset_assignment_status();

-- Depreciation Book Value Calculation
CREATE OR REPLACE FUNCTION trg_fn_calculate_book_value()
RETURNS TRIGGER AS $$
DECLARE
    v_last_book_value NUMERIC(15, 2);
    v_salvage_value NUMERIC(15, 2);
BEGIN
    SELECT book_value INTO v_last_book_value
    FROM asset_depreciations
    WHERE asset_id = NEW.asset_id AND id IS DISTINCT FROM NEW.id
    ORDER BY period_date DESC, created_at DESC
    LIMIT 1;

    IF v_last_book_value IS NULL THEN
        SELECT purchase_cost, salvage_value 
        INTO v_last_book_value, v_salvage_value
        FROM assets
        WHERE id = NEW.asset_id;
    ELSE
        SELECT salvage_value 
        INTO v_salvage_value
        FROM assets
        WHERE id = NEW.asset_id;
    END IF;

    NEW.book_value := GREATEST(v_last_book_value - NEW.depreciation_amount, COALESCE(v_salvage_value, 0));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_depreciation_book_value
BEFORE INSERT ON asset_depreciations
FOR EACH ROW
EXECUTE FUNCTION trg_fn_calculate_book_value();

-- Disposal Handler
CREATE OR REPLACE FUNCTION trg_fn_handle_asset_disposal()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE assets
    SET 
        status = 'disposed',
        assigned_to = NULL
    WHERE id = NEW.asset_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_on_asset_disposed
AFTER INSERT ON asset_disposals
FOR EACH ROW
EXECUTE FUNCTION trg_fn_handle_asset_disposal();

-- License Seats Sync Trigger Function
-- ponytail: hanya INSERT/DELETE; UPDATE license_id dianggap lepas+pasang baru bila dibutuhkan
CREATE OR REPLACE FUNCTION trg_fn_sync_license_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE software_licenses
        SET seats_used = seats_used + 1
        WHERE id = NEW.license_id AND seats_used < seats_total;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'License seats exhausted for license %', NEW.license_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE software_licenses
        SET seats_used = GREATEST(seats_used - 1, 0)
        WHERE id = OLD.license_id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_license_seats_insert
BEFORE INSERT ON asset_software_allocations
FOR EACH ROW
EXECUTE FUNCTION trg_fn_sync_license_seats();

CREATE TRIGGER trg_sync_license_seats_delete
AFTER DELETE ON asset_software_allocations
FOR EACH ROW
EXECUTE FUNCTION trg_fn_sync_license_seats();

-- Audit History Logging Trigger
CREATE OR REPLACE FUNCTION trg_fn_log_asset_history()
RETURNS TRIGGER AS $$
DECLARE
    v_action VARCHAR(50) := 'UPDATED';
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO asset_histories (
            asset_id,
            action_type,
            new_status,
            new_assigned_to,
            new_location_id,
            details,
            performed_by_user_id
        ) VALUES (
            NEW.id,
            'CREATED',
            NEW.status,
            NEW.assigned_to,
            NEW.location_id,
            jsonb_build_object('initial_data', to_jsonb(NEW)),
            NEW.created_by
        );
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            v_action := 'STATUS_CHANGED';
        ELSIF OLD.location_id IS DISTINCT FROM NEW.location_id THEN
            v_action := 'RELOCATED';
        ELSIF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
            v_action := CASE 
                WHEN NEW.assigned_to IS NOT NULL THEN 'ASSIGNED' 
                ELSE 'RETURNED' 
            END;
        ELSIF OLD.is_deleted IS DISTINCT FROM NEW.is_deleted AND NEW.is_deleted = TRUE THEN
            v_action := 'DELETED';
        END IF;

        IF (OLD.status IS DISTINCT FROM NEW.status) OR 
           (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) OR 
           (OLD.location_id IS DISTINCT FROM NEW.location_id) OR
           (OLD.is_deleted IS DISTINCT FROM NEW.is_deleted) THEN
            
            INSERT INTO asset_histories (
                asset_id,
                action_type,
                old_status,
                new_status,
                old_assigned_to,
                new_assigned_to,
                old_location_id,
                new_location_id,
                details,
                performed_by_user_id
            ) VALUES (
                NEW.id,
                v_action,
                OLD.status,
                NEW.status,
                OLD.assigned_to,
                NEW.assigned_to,
                OLD.location_id,
                NEW.location_id,
                jsonb_build_object(
                    'old', jsonb_build_object('status', OLD.status, 'assigned_to', OLD.assigned_to, 'location_id', OLD.location_id, 'is_deleted', OLD.is_deleted),
                    'new', jsonb_build_object('status', NEW.status, 'assigned_to', NEW.assigned_to, 'location_id', NEW.location_id, 'is_deleted', NEW.is_deleted)
                ),
                NEW.updated_by
            );
        END IF;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_asset_history
AFTER INSERT OR UPDATE ON assets
FOR EACH ROW
EXECUTE FUNCTION trg_fn_log_asset_history();

-- ============================================================================
-- 5. STORED PROCEDURE
-- ============================================================================

CREATE OR REPLACE PROCEDURE sp_generate_monthly_depreciation(p_period_date DATE)
LANGUAGE plpgsql
AS $$
DECLARE
    v_record RECORD;
    v_monthly_depreciation NUMERIC(15, 2);
    v_current_book_value NUMERIC(15, 2);
    v_depreciation_to_apply NUMERIC(15, 2);
    v_processed_count INT := 0;
BEGIN
    p_period_date := DATE_TRUNC('month', p_period_date)::DATE;

    FOR v_record IN
        SELECT 
            a.id AS asset_id,
            a.purchase_cost,
            COALESCE(a.salvage_value, 0) AS salvage_value,
            a.useful_life_years,
            COALESCE(
                (
                    SELECT d.book_value 
                    FROM asset_depreciations d 
                    WHERE d.asset_id = a.id 
                    ORDER BY d.period_date DESC, d.created_at DESC 
                    LIMIT 1
                ),
                a.purchase_cost
            ) AS latest_book_value
        FROM assets a
        WHERE a.status IN ('available', 'in_use')
          AND a.is_deleted = FALSE
          AND a.depreciation_method = 'straight_line'
          AND a.useful_life_years > 0
          AND a.purchase_date <= p_period_date
          AND NOT EXISTS (
              SELECT 1 
              FROM asset_depreciations ad 
              WHERE ad.asset_id = a.id 
                AND DATE_TRUNC('month', ad.period_date)::DATE = p_period_date
          )
    LOOP
        v_current_book_value := v_record.latest_book_value;

        IF v_current_book_value <= v_record.salvage_value THEN
            CONTINUE;
        END IF;

        v_monthly_depreciation := ROUND(
            (v_record.purchase_cost - v_record.salvage_value) / (v_record.useful_life_years * 12),
            2
        );

        IF (v_current_book_value - v_monthly_depreciation) < v_record.salvage_value THEN
            v_depreciation_to_apply := v_current_book_value - v_record.salvage_value;
        ELSE
            v_depreciation_to_apply := v_monthly_depreciation;
        END IF;

        INSERT INTO asset_depreciations (
            asset_id,
            period_date,
            depreciation_amount,
            book_value
        ) VALUES (
            v_record.asset_id,
            p_period_date,
            v_depreciation_to_apply,
            0
        );

        v_processed_count := v_processed_count + 1;
    END LOOP;

    RAISE NOTICE 'Selesai: % aset berhasil diproses untuk periode %.', v_processed_count, p_period_date;
END;
$$;

-- ============================================================================
-- 6. VIEWS
-- ============================================================================

-- View Timeline Riwayat Aset
CREATE OR REPLACE VIEW v_asset_history_timeline AS
SELECT 
    h.id AS history_id,
    h.created_at AS event_timestamp,
    a.id AS asset_id,
    a.asset_code,
    a.name AS asset_name,
    ac.name AS category_name,
    cs.computer_name,
    cs.ip_address,
    h.action_type,
    h.old_status,
    h.new_status,
    
    h.old_assigned_to AS old_employee_id,
    emp_old.full_name AS old_employee_name,
    dept_old.name AS old_department_name,
    
    h.new_assigned_to AS new_employee_id,
    emp_new.full_name AS new_employee_name,
    dept_new.name AS new_department_name,
    
    h.old_location_id,
    CASE 
        WHEN loc_old.id IS NOT NULL THEN 
            CONCAT_WS(' - ', loc_old.building, NULLIF(loc_old.floor, ''), loc_old.room)
        ELSE NULL 
    END AS old_location_full,
    
    h.new_location_id,
    CASE 
        WHEN loc_new.id IS NOT NULL THEN 
            CONCAT_WS(' - ', loc_new.building, NULLIF(loc_new.floor, ''), loc_new.room)
        ELSE NULL 
    END AS new_location_full,
    
    COALESCE(h.performed_by_user_id, u_actor.id) AS actor_user_id,
    COALESCE(u_actor.username, actor.full_name) AS actor_name,
    h.notes,
    h.reference_table,
    h.reference_id,
    h.details,
    
    CASE h.action_type
        WHEN 'CREATED' THEN 'Aset pertama kali didaftarkan ke sistem'
        WHEN 'ASSIGNED' THEN CONCAT('Aset diserahkan kepada ', COALESCE(emp_new.full_name, 'karyawan'))
        WHEN 'RETURNED' THEN CONCAT('Aset dikembalikan oleh ', COALESCE(emp_old.full_name, 'karyawan'))
        WHEN 'RELOCATED' THEN CONCAT('Dipindahkan ke ', COALESCE(loc_new.room, 'lokasi baru'))
        WHEN 'STATUS_CHANGED' THEN CONCAT('Status diubah dari ', COALESCE(h.old_status, '-'), ' ke ', COALESCE(h.new_status, '-'))
        WHEN 'DELETED' THEN 'Aset dihapus (soft delete)'
        WHEN 'MAINTAINED' THEN 'Aset menjalani jadwal servis/pemeliharaan'
        WHEN 'DEPRECIATED' THEN 'Penyusutan nilai buku aset dicatat'
        WHEN 'DISPOSED' THEN 'Aset telah dihapuskan/dilepas dari inventaris'
        ELSE CONCAT('Aktivitas: ', h.action_type)
    END AS activity_summary

FROM asset_histories h
JOIN assets a ON h.asset_id = a.id
JOIN asset_categories ac ON a.category_id = ac.id
LEFT JOIN computer_specifications cs ON a.id = cs.asset_id
LEFT JOIN employees emp_old ON h.old_assigned_to = emp_old.id
LEFT JOIN departments dept_old ON emp_old.department_id = dept_old.id
LEFT JOIN employees emp_new ON h.new_assigned_to = emp_new.id
LEFT JOIN departments dept_new ON emp_new.department_id = dept_new.id
LEFT JOIN locations loc_old ON h.old_location_id = loc_old.id
LEFT JOIN locations loc_new ON h.new_location_id = loc_new.id
LEFT JOIN employees actor ON h.performed_by = actor.id
LEFT JOIN users u_actor ON h.performed_by_user_id = u_actor.id;

-- View Inventaris Komputer Lengkap (Format Tabel Excel)
CREATE OR REPLACE VIEW v_computer_inventory AS
SELECT 
    a.id AS asset_id,
    dept.name AS department_name,
    cs.ip_address,
    a.asset_code,
    cs.computer_name,
    emp.full_name AS user_name,
    cs.ms_office_version,
    cs.os_name,
    cs.processor_detail,
    cs.cpu_family,
    cs.ram_capacity_gb,
    cs.storage_detail,
    a.status AS asset_status,
    loc.room AS current_room
FROM assets a
JOIN computer_specifications cs ON a.id = cs.asset_id
LEFT JOIN employees emp ON a.assigned_to = emp.id
LEFT JOIN departments dept ON emp.department_id = dept.id
LEFT JOIN locations loc ON a.location_id = loc.id
WHERE a.is_deleted = FALSE;

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id INT PRIMARY KEY DEFAULT 1,
  org_name VARCHAR(150) NOT NULL DEFAULT 'PT Kenertec',
  currency VARCHAR(50) NOT NULL DEFAULT 'IDR (Rp - Indonesian Rupiah)',
  depreciation_method VARCHAR(100) NOT NULL DEFAULT 'straight_line',
  maintenance_alert_days INT NOT NULL DEFAULT 14,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_settings (id, org_name, currency, depreciation_method, maintenance_alert_days)
VALUES (1, 'PT Kenertec', 'IDR (Rp - Indonesian Rupiah)', 'straight_line', 14)
ON CONFLICT (id) DO NOTHING;

COMMIT;
