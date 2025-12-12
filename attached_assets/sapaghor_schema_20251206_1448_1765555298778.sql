-- Sapaghor ERP minimal schema
-- Safe to run on PostgreSQL (adjust as needed).

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE order_status AS ENUM (
    'Pre Order','Order','Assign Designer','Proof','Confirm','Payment',
    'In Process','Printing','Binding','Ready for delivery','Delivery','Cancelled'
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    first_committed_date DATE,
    delivery_date DATE,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    status order_status DEFAULT 'Pre Order',
    assigned_designer TEXT,
    design_fee NUMERIC(12,2) DEFAULT 0,
    urgency_fee NUMERIC(12,2) DEFAULT 0,
    cashing_fee NUMERIC(12,2) DEFAULT 0,
    misc_fee NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0,
    grand_total NUMERIC(12,2) GENERATED ALWAYS AS (total_amount + design_fee + urgency_fee + cashing_fee + misc_fee - discount) STORED,
    paid NUMERIC(12,2) DEFAULT 0,
    notes TEXT
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    description TEXT,
    size TEXT,
    quantity NUMERIC(12,2) DEFAULT 0,
    unit TEXT DEFAULT 'pcs',
    color TEXT,
    paper TEXT,
    certificate TEXT,
    binding TEXT,
    others TEXT,
    rate NUMERIC(12,2) DEFAULT 0,
    amount NUMERIC(12,2) GENERATED ALWAYS AS (quantity * rate) STORED
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    txn_date DATE NOT NULL DEFAULT CURRENT_DATE,
    txn_type TEXT CHECK (txn_type IN ('Cash','Bank','bKash','Nagad','Rocket','Other')),
    amount NUMERIC(12,2) NOT NULL,
    reference TEXT,
    notes TEXT
);

CREATE TABLE production_log (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    stage order_status NOT NULL,
    department TEXT CHECK (department IN ('Management','Design','Output','Account','Production','Delivery')),
    assigned_to TEXT,
    start_at TIMESTAMP DEFAULT NOW(),
    end_at TIMESTAMP,
    status_note TEXT
);

CREATE TABLE design_proofs (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    assigned_designer TEXT,
    brief TEXT,
    proof_no TEXT,
    proof_date DATE,
    approved_by TEXT,
    approval_date DATE,
    remarks TEXT
);

CREATE TABLE printing (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    plate_ctp BOOLEAN DEFAULT FALSE,
    press TEXT,
    pass_count INTEGER,
    colors TEXT,
    start_at TIMESTAMP,
    end_at TIMESTAMP,
    inspector TEXT,
    remarks TEXT
);

CREATE TABLE binding (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    type TEXT,
    pages INTEGER,
    numbering_font TEXT,
    start_at TIMESTAMP,
    end_at TIMESTAMP,
    remarks TEXT
);

CREATE TABLE delivery (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    recipient_name TEXT,
    address TEXT,
    phone TEXT,
    delivery_date DATE,
    vehicle TEXT,
    delivered_by TEXT,
    notes TEXT
);

-- Basic AR view
CREATE VIEW v_receivables AS
SELECT o.id as order_id, c.name as customer, o.grand_total, o.paid, (o.grand_total - o.paid) AS balance, o.status
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
WHERE o.status <> 'Cancelled';