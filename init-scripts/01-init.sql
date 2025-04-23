-- Ten skrypt zostanie wykonany przy pierwszym uruchomieniu kontenera postgres
-- Utworzenie schematu bazy danych

-- Tworzenie rozszerzeń
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tworzenie użytkownika admin (jeśli nie istnieje)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin'
    ) THEN
        CREATE USER admin WITH PASSWORD '5N13gul!';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE financedb TO admin;

-- Tabele główne

-- 1. Oddziały (departments)
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeks dla szybkiego wyszukiwania po nazwie
CREATE INDEX idx_departments_name ON departments(name);

-- 2. Grupy (groups)
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, department_id)
);

-- Indeksy dla szybkiego wyszukiwania
CREATE INDEX idx_groups_department_id ON groups(department_id);
CREATE INDEX idx_groups_name ON groups(name);

-- 3. Rodzaje usług (service_types)
CREATE TABLE service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (code)
);

-- Indeksy dla szybkiego wyszukiwania
CREATE INDEX idx_service_types_code ON service_types(code);
CREATE INDEX idx_service_types_name ON service_types(name);

-- 4. Kontrahenci (contractors)
CREATE TABLE contractors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    nip VARCHAR(20),
    address TEXT,
    contact_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (nip)
);

-- Indeksy dla szybkiego wyszukiwania
CREATE INDEX idx_contractors_name ON contractors(name);
CREATE INDEX idx_contractors_nip ON contractors(nip);

-- 5. Kategorie kosztów (cost_categories)
CREATE TABLE cost_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INTEGER REFERENCES cost_categories(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy dla szybkiego wyszukiwania
CREATE INDEX idx_cost_categories_name ON cost_categories(name);
CREATE INDEX idx_cost_categories_parent_id ON cost_categories(parent_id);

-- Tabele transakcyjne

-- 1. Zakupy/Koszty (purchases)
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100),
    contractor_id INTEGER REFERENCES contractors(id),
    department_id INTEGER REFERENCES departments(id),
    cost_category_id INTEGER REFERENCES cost_categories(id),
    service_type_id INTEGER REFERENCES service_types(id),
    date DATE NOT NULL,
    amount_net DECIMAL(12, 2) NOT NULL,
    vat_amount DECIMAL(12, 2) NOT NULL,
    amount_gross DECIMAL(12, 2) NOT NULL,
    allocation_percentage DECIMAL(5, 2) DEFAULT 100.00,
    description TEXT,
    document_reference VARCHAR(255),
    file_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imported_at TIMESTAMP,
    import_batch_id VARCHAR(100),
    CONSTRAINT unique_purchase UNIQUE (invoice_number, contractor_id, department_id, service_type_id, amount_net, amount_gross, date, allocation_percentage)
);

-- Indeksy dla szybkiego wyszukiwania i analizy
CREATE INDEX idx_purchases_date ON purchases(date);
CREATE INDEX idx_purchases_department_id ON purchases(department_id);
CREATE INDEX idx_purchases_service_type_id ON purchases(service_type_id);
CREATE INDEX idx_purchases_contractor_id ON purchases(contractor_id);
CREATE INDEX idx_purchases_cost_category_id ON purchases(cost_category_id);
CREATE INDEX idx_purchases_import_batch_id ON purchases(import_batch_id);

-- 2. Wypłaty (payroll)
CREATE TABLE payroll (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(100),
    department_id INTEGER REFERENCES departments(id),
    group_id INTEGER REFERENCES groups(id),
    service_type_id INTEGER REFERENCES service_types(id),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    gross_salary DECIMAL(12, 2) NOT NULL,
    net_salary DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) NOT NULL,
    social_security DECIMAL(12, 2) NOT NULL,
    health_insurance DECIMAL(12, 2) NOT NULL,
    other_deductions JSONB,
    other_additions JSONB,
    description TEXT,
    payment_date DATE,
    file_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imported_at TIMESTAMP,
    import_batch_id VARCHAR(100),
    CONSTRAINT unique_payroll UNIQUE (employee_id, department_id, group_id, service_type_id, month, year)
);

-- Indeksy dla szybkiego wyszukiwania i analizy
CREATE INDEX idx_payroll_year_month ON payroll(year, month);
CREATE INDEX idx_payroll_department_id ON payroll(department_id);
CREATE INDEX idx_payroll_group_id ON payroll(group_id);
CREATE INDEX idx_payroll_service_type_id ON payroll(service_type_id);
CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX idx_payroll_import_batch_id ON payroll(import_batch_id);

-- 3. Sprzedaż/Przychody (sales)
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100),
    customer_id INTEGER REFERENCES contractors(id),
    department_id INTEGER REFERENCES departments(id),
    service_type_id INTEGER REFERENCES service_types(id),
    date DATE NOT NULL,
    amount_net DECIMAL(12, 2) NOT NULL,
    vat_amount DECIMAL(12, 2) NOT NULL,
    amount_gross DECIMAL(12, 2) NOT NULL,
    description TEXT,
    document_reference VARCHAR(255),
    file_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imported_at TIMESTAMP,
    import_batch_id VARCHAR(100),
    CONSTRAINT unique_sale UNIQUE (invoice_number, customer_id, department_id, service_type_id, amount_net, amount_gross, date)
);

-- Indeksy dla szybkiego wyszukiwania i analizy
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_department_id ON sales(department_id);
CREATE INDEX idx_sales_service_type_id ON sales(service_type_id);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_import_batch_id ON sales(import_batch_id);

-- Tabele do zarządzania plikami

-- 1. Zaimportowane pliki (imported_files)
CREATE TABLE imported_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'purchase', 'payroll', 'sales'
    file_size BIGINT NOT NULL,
    file_hash VARCHAR(64) NOT NULL UNIQUE,  -- hash zawartości pliku dla wykrywania duplikatów
    import_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    error_message TEXT,
    import_batch_id VARCHAR(100),
    imported_by INTEGER, -- reference to users table
    imported_rows INTEGER DEFAULT 0,
    duplicate_rows INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy
CREATE INDEX idx_imported_files_file_type ON imported_files(file_type);
CREATE INDEX idx_imported_files_import_status ON imported_files(import_status);
CREATE INDEX idx_imported_files_import_batch_id ON imported_files(import_batch_id);

-- Tabele systemowe

-- 1. Użytkownicy (users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- 'admin', 'user', 'viewer'
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Logi aplikacji (application_logs)
CREATE TABLE application_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'purchase', 'payroll', 'sales', 'import', etc.
    entity_id INTEGER,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy
CREATE INDEX idx_application_logs_user_id ON application_logs(user_id);
CREATE INDEX idx_application_logs_action ON application_logs(action);
CREATE INDEX idx_application_logs_entity_type ON application_logs(entity_type);
CREATE INDEX idx_application_logs_created_at ON application_logs(created_at);

-- 3. Zapisane widoki i filtry (saved_views)
CREATE TABLE saved_views (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    view_type VARCHAR(50) NOT NULL, -- 'dashboard', 'report', 'analysis'
    is_public BOOLEAN DEFAULT FALSE,
    configuration JSONB NOT NULL, -- zawiera definicję filtrów, widgetów itp.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name, view_type)
);

-- Indeksy
CREATE INDEX idx_saved_views_user_id ON saved_views(user_id);
CREATE INDEX idx_saved_views_view_type ON saved_views(view_type);
CREATE INDEX idx_saved_views_is_public ON saved_views(is_public);

-- Funkcje i triggery

-- 1. Trigger dla aktualizacji timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Przykład zastosowania triggera
CREATE TRIGGER update_departments_timestamp
BEFORE UPDATE ON departments
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

-- Dodanie triggerów dla wszystkich tabel
CREATE TRIGGER update_groups_timestamp
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_service_types_timestamp
BEFORE UPDATE ON service_types
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_contractors_timestamp
BEFORE UPDATE ON contractors
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_cost_categories_timestamp
BEFORE UPDATE ON cost_categories
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_purchases_timestamp
BEFORE UPDATE ON purchases
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_payroll_timestamp
BEFORE UPDATE ON payroll
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_sales_timestamp
BEFORE UPDATE ON sales
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_imported_files_timestamp
BEFORE UPDATE ON imported_files
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_saved_views_timestamp
BEFORE UPDATE ON saved_views
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

-- 2. Funkcja do weryfikacji duplikatów
CREATE OR REPLACE FUNCTION check_purchase_duplicate(
    p_invoice_number VARCHAR,
    p_contractor_id INTEGER,
    p_department_id INTEGER,
    p_service_type_id INTEGER,
    p_amount_net DECIMAL,
    p_amount_gross DECIMAL,
    p_date DATE,
    p_allocation_percentage DECIMAL
) RETURNS BOOLEAN AS $$
DECLARE
    duplicate_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM purchases
        WHERE invoice_number = p_invoice_number
        AND contractor_id = p_contractor_id
        AND department_id = p_department_id
        AND service_type_id = p_service_type_id
        AND amount_net = p_amount_net
        AND amount_gross = p_amount_gross
        AND date = p_date
        AND allocation_percentage = p_allocation_percentage
    ) INTO duplicate_exists;
    
    RETURN duplicate_exists;
END;
$$ LANGUAGE plpgsql;

-- Początkowe wypełnienie bazy danych

-- Domyślny administrator
INSERT INTO users (username, password_hash, email, full_name, role)
VALUES ('admin', crypt('5N13gul!', gen_salt('bf')), 'admin@example.com', 'Administrator', 'admin');

-- Podstawowe typy usług
INSERT INTO service_types (name, code, description)
VALUES 
('Instalacja', 'INST', 'Usługi instalacyjne'),
('Drop', 'DROP', 'Usługi typu drop'),
('Serwis', 'SERW', 'Usługi serwisowe'),
('Konsultacje', 'KONS', 'Usługi konsultacyjne');

-- Podstawowe kategorie kosztów
INSERT INTO cost_categories (name, description)
VALUES 
('Wynagrodzenia', 'Koszty wynagrodzeń pracowników'),
('Materiały', 'Koszty materiałów'),
('Usługi zewnętrzne', 'Koszty usług podwykonawczych'),
('Administracyjne', 'Koszty administracyjne');
