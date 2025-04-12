-- Active: 1744214608473@@127.0.0.1@5432@Inventory Module
DROP TABLE IF EXISTS stock_movements, store_stock, stores, products CASCADE;

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL
);

CREATE TABLE store_stock (
    id SERIAL PRIMARY KEY,
    store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity >= 0),
    UNIQUE (store_id, product_id)
);

CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    change INT NOT NULL,  -- Positive for stock-in, negative for sales/removal
    type TEXT NOT NULL CHECK (type IN ('stock-in', 'sold', 'remove')),  
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔄 Reset all tables before inserting new data
TRUNCATE TABLE stock_movements, store_stock, stores, products RESTART IDENTITY CASCADE;

INSERT INTO products (name, price) VALUES
('Rice (1 kg)', 225), ('Wheat Flour (1 kg)', 120), ('Sugar (1 kg)', 170),
('Salt (1 kg)', 62.50), ('Cooking Oil (1 liter)', 560), ('Milk (1 liter)', 360),
('Butter (1 kg)', 275), ('Cheese (1 kg)', 420), ('Eggs (Dozen)', 430),
('Bread (500g)', 55), ('Pasta (500g)', 90), ('Tomato Ketchup (1 liter)', 200),
('Mayonnaise (1 kg)', 350), ('Tea (1 kg)', 900), ('Coffee (500g)', 600),
('Honey (1 kg)', 750), ('Jam (500g)', 325), ('Peanut Butter (500g)', 450),
('Cornflakes (500g)', 550), ('Oats (500g)', 375), ('Chicken (1 kg)', 975),
('Beef (1 kg)', 1400), ('Fish (1 kg)', 850), ('Mutton (1 kg)', 1400),
('Vegetable Oil (1 liter)', 325), ('Lentils (1 kg)', 280), ('Chickpeas (1 kg)', 300),
('Green Peas (1 kg)', 240), ('Carrots (1 kg)', 150), ('Tomatoes (1 kg)', 200),
('Onions (1 kg)', 180), ('Garlic (1 kg)', 300), ('Ginger (1 kg)', 350),
('Potatoes (1 kg)', 120), ('Cabbage (1 kg)', 175), ('Spinach (1 kg)', 210),
('Broccoli (1 kg)', 275), ('Mango (1 kg)', 500), ('Apple (1 kg)', 420),
('Banana (1 kg)', 250), ('Orange (1 kg)', 300), ('Strawberries (500g)', 325),
('Pineapple (1 kg)', 575), ('Watermelon (1 kg)', 700), ('Lemon (1 kg)', 225),
('Cucumber (1 kg)', 190), ('Yogurt (1 kg)', 320), ('Ice Cream (1 liter)', 500),
('Soft Drinks (1 liter)', 175), ('Biscuits (500g)', 250);


INSERT INTO stores (name, location) VALUES
('Alpha Groceries 1', 'Saddar, Karachi, Sindh'),
('Beta Groceries 1', 'Gulshan-e-Iqbal, Karachi, Sindh'),
('Gamma Mart 1', 'F-10 Markaz, Islamabad, Punjab'),
('Delta Supermarket 1', 'Liberty Market, Lahore, Punjab'),
('Echo Groceries 1', 'DHA Phase 5, Lahore, Punjab'),
('Foxtrot Market 1', 'Mall Road, Lahore, Punjab'),
('Hotel Groceries 1', 'Clifton, Karachi, Sindh'),
('India Mart 1', 'Bani Gala, Islamabad, Punjab'),
('Juliet Supermarket 1', 'Faisal Town, Islamabad, Punjab'),
('Kilo Mart 1', 'Korangi, Karachi, Sindh'),
('Lima Groceries 1', 'Model Town, Lahore, Punjab'),
('Mike Supermarket 1', 'Saddar, Rawalpindi, Punjab'),
('November Market 1', 'G-9 Markaz, Islamabad, Punjab'),
('Oscar Groceries 1', 'Peshawar Road, Rawalpindi, Punjab'),
('Papa Supermarket 1', 'Bahria Town, Rawalpindi, Punjab'),
('Quebec Groceries 1', 'Lahore Cantt, Lahore, Punjab'),
('Romeo Mart 1', 'Sargodha, Punjab'),
('Tango Market 1', 'Gulberg, Lahore, Punjab'),
('Uniform Groceries 1', 'Johar Town, Lahore, Punjab'),
('Victor Mart 1', 'Mardan, Khyber Pakhtunkhwa'),
('Whiskey Supermarket 1', 'Multan Road, Lahore, Punjab'),
('X-ray Mart 1', 'Faisalabad, Punjab'),
('Yankee Groceries 1', 'Quetta, Balochistan'),
('Zulu Supermarket 1', 'Sahiwal, Punjab'),
('Alpha Mart 2', 'Abbottabad, Khyber Pakhtunkhwa'),
('Bravo Mart 1', 'Bahawalpur, Punjab'),
('Charlie Mart 1', 'Jhelum, Punjab'),
('Delta Groceries 2', 'Rawat, Punjab'),
('Echo Market 2', 'Dera Ghazi Khan, Punjab'),
('Foxtrot Supermarket 2', 'Murree, Punjab'),
('Gamma Mart 2', 'Gujranwala, Punjab'),
('Hotel Mart 2', 'Sialkot, Punjab'),
('India Groceries 2', 'Islamabad, Punjab'),
('Juliet Groceries 2', 'Sargodha, Punjab'),
('Kilo Mart 2', 'Sukkur, Sindh'),
('Lima Supermarket 2', 'Karachi Cantt, Sindh'),
('Mike Mart 2', 'Quetta, Balochistan'),
('November Mart 2', 'Karachi, Sindh'),
('Oscar Mart 2', 'Lahore, Punjab'),
('Papa Groceries 2', 'Islamabad, Punjab'),
('Quebec Mart 2', 'Faisalabad, Punjab'),
('Romeo Mart 2', 'Multan, Punjab'),
('Tango Supermarket 2', 'Rawalpindi, Punjab'),
('Uniform Supermarket 2', 'Peshawar, Khyber Pakhtunkhwa'),
('Victor Mart 2', 'Bahawalpur, Punjab'),
('Whiskey Market 2', 'Rawalpindi, Punjab'),
('X-ray Supermarket 2', 'Lahore, Punjab'),
('Yankee Mart 2', 'Karachi, Sindh'),
('Zulu Mart 2', 'Quetta, Balochistan');

INSERT INTO store_stock (store_id, product_id, quantity)
SELECT s.id, p.id, FLOOR(RANDOM() * 100 + 1)
FROM stores s, products p;

SELECT * FROM stock_movements ;
TRUNCATE TABLE stock_movements;

INSERT INTO stock_movements (store_id, product_id, change, type, timestamp)
SELECT
    s.id,
    p.id,
    FLOOR(RANDOM() * 50) + 1 * (CASE WHEN FLOOR(RANDOM() * 3) = 0 THEN 1 ELSE -1 END) AS change,  
    CASE 
        WHEN FLOOR(RANDOM() * 3) = 0 THEN 'stock-in'  
        WHEN FLOOR(RANDOM() * 3) = 1 THEN 'sold'     
        ELSE 'remove'                                
    END AS type,
    NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 730)  
FROM stores s, products p;


UPDATE products
SET created_at = NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 730);


-- Testing Database by running different quries
SELECT * FROM stores WHERE location LIKE '%Lahore%';

SELECT DISTINCT s.name AS store_name, s.location, p.name AS product_name, ss.quantity
FROM stores s
JOIN store_stock ss ON s.id = ss.store_id
JOIN products p ON ss.product_id = p.id
WHERE p.name = 'Eggs (Dozen)';

SELECT p.name AS product, ss.quantity 
FROM store_stock ss
JOIN products p ON ss.product_id = p.id
WHERE ss.store_id = (SELECT id FROM stores WHERE location = 'Islamabad, Punjab' LIMIT 1);

SELECT s.name AS store, ss.quantity
FROM store_stock ss
JOIN stores s ON ss.store_id = s.id
WHERE ss.product_id = (SELECT id FROM products WHERE name = 'Rice (1 kg)');

SELECT sm.timestamp, p.name AS product, sm.change, sm.type
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
WHERE sm.timestamp >= (CURRENT_DATE - INTERVAL '60 days')
ORDER BY sm.timestamp DESC; 


SELECT p.name AS product
FROM store_stock ss
JOIN products p ON ss.product_id = p.id
WHERE ss.store_id = (SELECT id FROM stores WHERE name = 'Romeo Mart 2')
AND ss.quantity = 5;


SELECT 
    p.name AS product, 
    ss.quantity
FROM store_stock ss
JOIN products p ON ss.product_id = p.id
WHERE ss.store_id = (SELECT id FROM stores WHERE name = 'Romeo Mart 2');


SELECT s.name AS store, p.name AS product, ss.quantity
FROM store_stock ss
JOIN stores s ON ss.store_id = s.id
JOIN products p ON ss.product_id = p.id
WHERE ss.quantity < 5
ORDER BY ss.quantity ASC;


SELECT p.name AS product, SUM(ABS(sm.change)) AS total_sold  
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
WHERE sm.type = 'remove' 
AND p.name = 'Eggs (Dozen)'
GROUP BY p.name;


SELECT p.name AS product, SUM(ss.quantity) AS total_stock
FROM store_stock ss
JOIN products p ON ss.product_id = p.id
GROUP BY p.name
ORDER BY total_stock DESC
LIMIT 5;


SELECT p.name AS product, SUM(ABS(sm.change)) AS total_sold
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
WHERE sm.type = 'sold'  
GROUP BY p.name
ORDER BY total_sold DESC
LIMIT 5;



SELECT s.name AS store, SUM(ABS(sm.change)) AS total_sold
FROM stock_movements sm
JOIN stores s ON sm.store_id = s.id
WHERE sm.type = 'sold' 
GROUP BY s.name
ORDER BY total_sold DESC
LIMIT 3;



SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.price,
    ss.quantity
FROM 
    store_stock ss
JOIN 
    products p ON ss.product_id = p.id
WHERE 
    ss.store_id = 1;

SELECT 
  
    s.name AS store_name,
    p.id AS product_id,
    p.name AS product_name,
    ss.quantity
FROM 
    store_stock ss
JOIN 
    stores s ON ss.store_id = s.id
JOIN 
    products p ON ss.product_id = p.id
WHERE 
    ss.store_id = 15
ORDER BY 
    ss.store_id, p.name;


SELECT 
  ABS(SUM(sm.change)) AS total_quantity_sold,
  ABS(SUM(sm.change * p.price)) AS total_revenue
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
WHERE sm.store_id = 1
  AND sm.type = 'sold'
  AND sm.timestamp >= '2023-07-25'
  AND sm.timestamp <= '2024-11-17';


SELECT 
    p.id AS product_id,
    p.name AS product_name,
    sm.timestamp
FROM 
    stock_movements sm
JOIN 
    products p ON sm.product_id = p.id
WHERE 
    sm.type = 'sold'
    AND sm.store_id = 1;

