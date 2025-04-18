// ============== stage 2 & 3 completed ======================

const { queryWrite, queryRead } = require("../db/database.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const redis = require("redis");

// Publisher for asynchronous events
const publisher = redis.createClient({ url: process.env.REDIS_URL });
publisher.connect().then(() => {
    console.log("Redis publisher connected");
}).catch(err => {
    console.error("Redis Publisher error:", err);
});

// A separate Redis client for caching
const cacheClient = redis.createClient({ url: process.env.REDIS_URL });
cacheClient.connect().then(() => {
    console.log("Redis cache connected");
}).catch(err => {
    console.error("Redis Cache error:", err);
});

// Users with roles: manager and customer
const users = [
    {
        id: 1,
        email: "manager@example.com",
        password: bcrypt.hashSync("password123", 10), // pre-hashed
        role: "manager"
    },
    {
        id: 2,
        email: "customer@example.com",
        password: bcrypt.hashSync("customerpass", 10), // pre-hashed
        role: "customer"
    },
];

// --------- Basic Authentication ----------
const loginUser = (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(400).json({ error: "User not found" });
    const match = bcrypt.compareSync(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" })
    const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    res.json({ token });
};

//Product Controller -- Implemented caching 
const createProduct = async (req, res) => {
    const { name, price } = req.body;
    try {
        const result = await queryWrite(
            `INSERT INTO products (name, price) VALUES ($1, $2) RETURNING id`,
            [name, price]
        );
        // Invalidate product cache
        await cacheClient.del("products");
        res.status(201).send({ message: "Product created", id: result.rows[0].id });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getAllProducts = async (req, res) => {
    try {
        const cachedData = await cacheClient.get("products");
        if (cachedData) {
            console.log("Cache hit for products");
            return res.status(200).json(JSON.parse(cachedData));
        }
        console.log("Cache miss for products");
        const result = await queryRead(`SELECT * FROM products ORDER BY id`);
        await cacheClient.setEx("products", 3600, JSON.stringify(result.rows));
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const updateProduct = async (req, res) => {
    const { productId } = req.params;
    const { name, price } = req.body;
    try {
        const result = await queryWrite(
            `UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *`,
            [name, price, productId]
        );
        if (result.rowCount === 0) {
            return res.status(404).send("Product not found");
        }
        // Invalidate product cache when updated
        await cacheClient.del("products");
        res.status(200).send("Product updated");
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Store Controllers 

const getAllStores = async (req, res) => {
    try {
        const result = await queryRead(`SELECT * FROM stores ORDER BY id`);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getStoreStock = async (req, res) => {
    const { storeId } = req.params;
    try {
        const result = await queryRead(
            `SELECT p.id AS product_id, p.name, p.price, ss.quantity
             FROM store_stock ss
             JOIN products p ON ss.product_id = p.id
             WHERE ss.store_id = $1`,
            [storeId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// -------------------- Stock Operations & Asynchronous Updates --------------------
const stockIn = async (req, res) => {
    const { storeId, productId } = req.params;
    const { quantity } = req.body;
    try {
        await queryWrite(
            `INSERT INTO store_stock (store_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (store_id, product_id)
             DO UPDATE SET quantity = store_stock.quantity + $3`,
            [storeId, productId, quantity]
        );
        await logStockMovement(storeId, productId, quantity, "stock-in");
        await cacheClient.del("products");
        res.status(200).send("Stocked in successfully.");
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const sellProduct = async (req, res) => {
    const { storeId, productId } = req.params;
    const { quantity } = req.body;
    try {
        const result = await queryWrite(
            `UPDATE store_stock SET quantity = quantity - $1
             WHERE store_id = $2 AND product_id = $3 AND quantity >= $1
             RETURNING *`,
            [quantity, storeId, productId]
        );
        if (result.rowCount === 0) {
            return res.status(400).send("Not enough stock");
        }
        await logStockMovement(storeId, productId, -quantity, "sold");
        res.status(200).send("Product sold successfully.");
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const removeStock = async (req, res) => {
    const { storeId, productId } = req.params;
    const { quantity } = req.body;
    try {
        const result = await queryWrite(
            `UPDATE store_stock SET quantity = quantity - $1
             WHERE store_id = $2 AND product_id = $3 AND quantity >= $1
             RETURNING *`,
            [quantity, storeId, productId]
        );
        if (result.rowCount === 0) {
            return res.status(400).send("Not enough stock");
        }
        await logStockMovement(storeId, productId, -quantity, "remove");
        res.status(200).send("Stock removed successfully.");
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// --------- Asynchronous Logging ---------
const logStockMovement = async (storeId, productId, change, type) => {
    await queryWrite(
        `INSERT INTO stock_movements (store_id, product_id, change, type, timestamp)
         VALUES ($1, $2, $3, $4, NOW())`,
        [storeId, productId, change, type]
    );
    const event = { storeId, productId, change, type, timestamp: new Date() };
    publisher.publish("stockMovement", JSON.stringify(event));
};

// Filtering & Reporting 
const getInventoryByDate = async (req, res) => {
    const { storeId } = req.params;
    const { date_from, date_to } = req.query;
    try {
        const result = await queryRead(
            `SELECT * FROM stock_movements
             WHERE store_id = $1 AND timestamp BETWEEN $2 AND $3
             ORDER BY timestamp DESC`,
            [storeId, date_from, date_to]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getTopSellingProducts = async (req, res) => {
    const { storeId } = req.params;
    const top = parseInt(req.query.top) || 5;
    try {
        const result = await queryRead(
            `SELECT p.id, p.name, SUM(ABS(sm.change)) AS sold_quantity
             FROM stock_movements sm
             JOIN products p ON sm.product_id = p.id
             WHERE sm.store_id = $1 AND sm.type = 'sold'
             GROUP BY p.id, p.name
             ORDER BY sold_quantity DESC
             LIMIT $2`,
            [storeId, top]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getLowStockProducts = async (req, res) => {
    const { storeId } = req.params;
    const threshold = parseInt(req.query.threshold) || 5;
    try {
        const result = await queryRead(
            `SELECT ss.product_id, p.name AS product_name, ss.quantity
             FROM store_stock ss
             JOIN products p ON ss.product_id = p.id
             WHERE ss.store_id = $1 AND ss.quantity <= $2`,
            [storeId, threshold]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getTotalSales = async (req, res) => {
    const { storeId } = req.params;
    const { date_from, date_to } = req.query;
    try {
        const result = await queryRead(
            `SELECT p.id, p.name, COUNT(*) AS sales_count,
                    SUM(ABS(sm.change) * p.price) AS total_revenue
             FROM stock_movements sm
             JOIN products p ON sm.product_id = p.id
             WHERE sm.store_id = $1 AND sm.type = 'sold'
             AND DATE(sm.timestamp) BETWEEN $2 AND $3
             GROUP BY p.id, p.name`,
            [storeId, date_from, date_to]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    updateProduct,
    getAllStores,
    getStoreStock,
    stockIn,
    sellProduct,
    removeStock,
    getInventoryByDate,
    getTopSellingProducts,
    getLowStockProducts,
    getTotalSales,
    loginUser,
    logStockMovement
};

// ============== stage 1 completed ======================

// const db = require("./database.js");

// // CREATE a new product
// const createItem = (name, quantity, price, callback) => {
//     const sql = `INSERT INTO item (name, current_quantity, price) VALUES (?, ?, ?)`;
//     db.run(sql, [name, quantity, price], function(err) {
//         if (err) {
//             console.error("Error inserting item:", err.message);
//             return callback(err, null);
//         }
//         callback(null, { id: this.lastID });
//     });
// };

// // READ all products
// const readItems = (callback) => {
//     const sql = `SELECT * FROM item`;
//     db.all(sql, [], callback);
// };

// // UPDATE product details (Fixed issue)
// const updateItem = (id, name, quantity, price, callback) => {
//     const sql = `UPDATE item SET name = ?, current_quantity = ?, price = ? WHERE id = ?`;
//     db.run(sql, [name, quantity, price, id], function(err) {
//         if (err) {
//             console.error("Error updating item:", err.message);
//             return callback(err);
//         }
//         if (this.changes === 0) {
//             return callback(new Error("No item found with the given ID."));
//         }
//         callback(null);
//     });
// };

// // DELETE a product
// const deleteItem = (id, callback) => {
//     const sql = `DELETE FROM item WHERE id = ?`;
//     db.run(sql, id, callback);
// };

// // STOCK IN a product
// const stockIn = (id, quantity, callback) => {
//     const sql = `UPDATE item SET current_quantity = current_quantity + ? WHERE id = ?`;
//     db.run(sql, [quantity, id], (err) => {
//         if (err) return callback(err);
//         logStockMovement(id, quantity, "stock-in", callback);
//     });
// };

// // SELL a product
// const sellItem = (id, quantity, callback) => {
//     const sql = `UPDATE item SET current_quantity = current_quantity - ? WHERE id = ? AND current_quantity >= ?`;
//     db.run(sql, [quantity, id, quantity], function (err) {
//         if (err) return callback(err);
//         if (this.changes === 0) return callback(new Error("Not enough stock"));
//         logStockMovement(id, -quantity, "sell", callback);
//     });
// };

// // MANUALLY REMOVE stock
// const removeStock = (id, quantity, callback) => {
//     const sql = `UPDATE item SET current_quantity = current_quantity - ? WHERE id = ? AND current_quantity >= ?`;
//     db.run(sql, [quantity, id, quantity], function (err) {
//         if (err) return callback(err);
//         if (this.changes === 0) return callback(new Error("Not enough stock"));
//         logStockMovement(id, -quantity, "remove", callback);
//     });
// };

// // LOG STOCK MOVEMENT
// const logStockMovement = (itemId, change, type, callback) => {
//     const sql = `INSERT INTO stock_movements (item_id, change, type) VALUES (?, ?, ?)`;
//     db.run(sql, [itemId, change, type], callback);
// };

// module.exports = { createItem, readItems, updateItem, deleteItem, stockIn, sellItem, removeStock };