// ========== stage 3 Read/Write Separation =========

const { Pool } = require("pg");
require("dotenv").config();


const writePool = new Pool({
    connectionString: process.env.PRIMARY_DB_URL,
    ssl: { rejectUnauthorized: false }
});

const readPool = new Pool({
    connectionString: process.env.REPLICA_DB_URL,
    ssl: { rejectUnauthorized: false }
});

writePool.connect((err, client, release) => {
    if (err) {
        console.error("Error connecting to primary DB:", err.message);
    } else {
        console.log("Connected to PRIMARY database.");
        release();
    }
});

readPool.connect((err, client, release) => {
    if (err) {
        console.error("Error connecting to read replica:", err.message);
    } else {
        console.log("Connected to READ REPLICA.");
        release();
    }
});

module.exports = {
    queryWrite: (text, params) => writePool.query(text, params),
    queryRead: (text, params) => readPool.query(text, params),
};



// ========== stage 2 completed  =========
// PostgreSQL connection   
// migrated to a relational database (PostgreSQL) for better performance and scalability
// and to support more complex queries and transactions.


// const { Pool } = require("pg");

// const pool = new Pool({
//     user: "postgres",            
//     host: "localhost",            
//     database: "Inventory Module", 
//     password: "12345",           
//     port: 5432,                 
// });

// // Test the database connection
// pool.connect((err, client, release) => {
//     if (err) {
//         console.error("Error connecting to PostgreSQL:", err.message);
//     } else {
//         console.log("Connected to PostgreSQL database.");
//         release();
//     }
// });

// module.exports = pool;




// ========== stage 1  completed =========  

// const sqlite3 = require("sqlite3").verbose();
// const dbName = "inventory.db";

// // Initialize database connection
// let db = new sqlite3.Database(dbName, (err) => {
//     if (err) {
//         console.error("Error connecting to database:", err.message);
//     } else {
//         console.log("Connected to SQLite database.");

//         // Create `item` table
//         db.run(`
//             CREATE TABLE IF NOT EXISTS item (
//                 id INTEGER PRIMARY KEY AUTOINCREMENT,
//                 name TEXT NOT NULL,
//                 current_quantity INTEGER NOT NULL CHECK(current_quantity >= 0),
//                 price REAL NOT NULL CHECK(price >= 0)
//             );
//         `, (err) => {
//             if (err) {
//                 console.error("Error creating item table:", err.message);
//             }
//         });

//         // Create `stock_movements` table
//         db.run(`
//             CREATE TABLE IF NOT EXISTS stock_movements (
//                 id INTEGER PRIMARY KEY AUTOINCREMENT,
//                 item_id INTEGER NOT NULL,
//                 change INTEGER NOT NULL,
//                 type TEXT NOT NULL CHECK(type IN ('stock-in', 'sell', 'remove')),
//                 timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
//                 FOREIGN KEY(item_id) REFERENCES item(id) ON DELETE CASCADE
//             );
//         `, (err) => {
//             if (err) {
//                 console.error("Error creating stock_movements table:", err.message);
//             }
//         });
//     }
// });

// // Export the database connection
// module.exports = db;