-- Gabba Restaurant Database Schema
-- Run: psql -U postgres -d gabba_db -f schema.sql

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- Burger, Pizza, Fries, Momo, Drinks
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    is_veg BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    is_bestseller BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    delivery_fee NUMERIC(10,2) DEFAULT 0,
    tax NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'razorpay', -- razorpay | cod
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | paid | failed
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    delivery_area VARCHAR(100),
    order_status VARCHAR(20) NOT NULL DEFAULT 'placed', -- placed, preparing, out_for_delivery, delivered, cancelled
    whatsapp_customer_sent BOOLEAN DEFAULT false,
    whatsapp_owner_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id),
    item_name VARCHAR(120) NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_menu_category ON menu_items(category);
CREATE INDEX idx_orders_user ON orders(user_id);
