const db = require("./database.js");

// CREATE a new product
const createItem = (name, quantity, price, callback) => {
    const sql = `INSERT INTO item (name, current_quantity, price) VALUES (?, ?, ?)`;
    db.run(sql, [name, quantity, price], function(err) {
        if (err) {
            console.error("Error inserting item:", err.message);
            return callback(err, null);
        }
        callback(null, { id: this.lastID });
    });
};

// READ all products
const readItems = (callback) => {
    const sql = `SELECT * FROM item`;
    db.all(sql, [], callback);
};

// UPDATE product details (Fixed issue)
const updateItem = (id, name, quantity, price, callback) => {
    const sql = `UPDATE item SET name = ?, current_quantity = ?, price = ? WHERE id = ?`;
    db.run(sql, [name, quantity, price, id], function(err) {
        if (err) {
            console.error("Error updating item:", err.message);
            return callback(err);
        }
        if (this.changes === 0) {
            return callback(new Error("No item found with the given ID."));
        }
        callback(null);
    });
};

// DELETE a product
const deleteItem = (id, callback) => {
    const sql = `DELETE FROM item WHERE id = ?`;
    db.run(sql, id, callback);
};

// STOCK IN a product
const stockIn = (id, quantity, callback) => {
    const sql = `UPDATE item SET current_quantity = current_quantity + ? WHERE id = ?`;
    db.run(sql, [quantity, id], (err) => {
        if (err) return callback(err);
        logStockMovement(id, quantity, "stock-in", callback);
    });
};

// SELL a product
const sellItem = (id, quantity, callback) => {
    const sql = `UPDATE item SET current_quantity = current_quantity - ? WHERE id = ? AND current_quantity >= ?`;
    db.run(sql, [quantity, id, quantity], function (err) {
        if (err) return callback(err);
        if (this.changes === 0) return callback(new Error("Not enough stock"));
        logStockMovement(id, -quantity, "sell", callback);
    });
};

// MANUALLY REMOVE stock
const removeStock = (id, quantity, callback) => {
    const sql = `UPDATE item SET current_quantity = current_quantity - ? WHERE id = ? AND current_quantity >= ?`;
    db.run(sql, [quantity, id, quantity], function (err) {
        if (err) return callback(err);
        if (this.changes === 0) return callback(new Error("Not enough stock"));
        logStockMovement(id, -quantity, "remove", callback);
    });
};

// LOG STOCK MOVEMENT
const logStockMovement = (itemId, change, type, callback) => {
    const sql = `INSERT INTO stock_movements (item_id, change, type) VALUES (?, ?, ?)`;
    db.run(sql, [itemId, change, type], callback);
};

module.exports = { createItem, readItems, updateItem, deleteItem, stockIn, sellItem, removeStock };
