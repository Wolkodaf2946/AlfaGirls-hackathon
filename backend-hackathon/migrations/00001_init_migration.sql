-- +goose Up
-- +goose StatementBegin

-- Пользователи
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    bank_account_number BIGINT,
    bank_card_number BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Типы магазинов (Техника, Сад, Продукты)
CREATE TABLE store_types (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    inn VARCHAR(155) NOT NULL
);

-- Дерево категорий
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    store_type_id INT REFERENCES store_types(id) ON DELETE SET NULL,
    parent_id INT REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(255) NOT NULL
);

-- Гранты
CREATE TABLE grants (
    id SERIAL PRIMARY KEY,
    grantor_id INT REFERENCES users(id),
    granter_id INT REFERENCES users(idё),
    grant_name TEXT NOT NULL,
    
    total_amount DECIMAL(18, 2) NOT NULL,
    must DECIMAL(18, 2), 

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Группы закупок
CREATE TABLE purchase_groups (
    id SERIAL PRIMARY KEY,
    grant_id INT REFERENCES grants(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id),
    
    name VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Позиции внутри группы
CREATE TABLE group_items (
    id SERIAL PRIMARY KEY,
    purchase_group_id INT REFERENCES purchase_groups(id) ON DELETE CASCADE,

    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS group_items;
DROP TABLE IF EXISTS purchase_groups;
DROP TABLE IF EXISTS grants;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS store_types;
DROP TABLE IF EXISTS users;
-- +goose StatementEnd