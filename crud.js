// ============== stage 2 ======================

const pool = require("./database.js");

// CREATE a new product
const createItem = async (name, quantity, price, callback) => {
    try {
        const result = await pool.query(
            `INSERT INTO item (name, current_quantity, price) VALUES ($1, $2, $3) RETURNING id`,
            [name, quantity, price]
        );
        callback(null, { id: result.rows[0].id });
    } catch (err) {
        console.error("Error inserting item:", err.message);
        callback(err, null);
    }
};

// READ all products
const readItems = async (callback) => {
    try {
        const result = await pool.query(`SELECT * FROM item`);
        callback(null, result.rows);
    } catch (err) {
        callback(err, null);
    }
};

// UPDATE product details
const updateItem = async (id, name, quantity, price, callback) => {
    try {
        const result = await pool.query(
            `UPDATE item SET name = $1, current_quantity = $2, price = $3 WHERE id = $4 RETURNING *`,
            [name, quantity, price, id]
        );
        if (result.rowCount === 0) return callback(new Error("No item found with the given ID."));
        callback(null);
    } catch (err) {
        callback(err);
    }
};

// DELETE a product
const deleteItem = async (id, callback) => {
    try {
        await pool.query(`DELETE FROM item WHERE id = $1`, [id]);
        callback(null);
    } catch (err) {
        callback(err);
    }
};

// STOCK IN a product
const stockIn = async (id, quantity, callback) => {
    try {
        await pool.query(`UPDATE item SET current_quantity = current_quantity + $1 WHERE id = $2`, [quantity, id]);
        await logStockMovement(id, quantity, "stock-in");
        callback(null);
    } catch (err) {
        callback(err);
    }
};

// SELL a product
const sellItem = async (id, quantity, callback) => {
    try {
        const result = await pool.query(
            `UPDATE item SET current_quantity = current_quantity - $1 WHERE id = $2 AND current_quantity >= $1 RETURNING *`,
            [quantity, id]
        );
        if (result.rowCount === 0) return callback(new Error("Not enough stock"));
        await logStockMovement(id, -quantity, "sell");
        callback(null);
    } catch (err) {
        callback(err);
    }
};

// MANUALLY REMOVE stock
const removeStock = async (id, quantity, callback) => {
    try {
        const result = await pool.query(
            `UPDATE item SET current_quantity = current_quantity - $1 WHERE id = $2 AND current_quantity >= $1 RETURNING *`,
            [quantity, id]
        );
        if (result.rowCount === 0) return callback(new Error("Not enough stock"));
        await logStockMovement(id, -quantity, "remove");
        callback(null);
    } catch (err) {
        callback(err);
    }
};

// LOG STOCK MOVEMENT
const logStockMovement = async (itemId, change, type) => {
    await pool.query(`INSERT INTO stock_movements (item_id, change, type) VALUES ($1, $2, $3)`, [itemId, change, type]);
};

module.exports = { createItem, readItems, updateItem, deleteItem, stockIn, sellItem, removeStock };


// ============== stage 1 ======================


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
