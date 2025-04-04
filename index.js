// ========== stage 2 =========
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();  // Load environment variables

const app = express();
app.use(express.json());

// Load routes
require("./routes/API.js")(app);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// ========== stage 1 =========

// const express = require('express');
// const { createItem, readItems, deleteItem, stockIn, sellItem, removeStock, updateItem } = require('./crud.js');

// const app = express();
// app.use(express.json());

// // Get all items
// app.get('/item', (req, res) => {
//    readItems((err, rows) => {
//          if (err) {
//               res.status(500).send(err.message);
//          } else {
//              res.status(200).json(rows);
//          }
//    });
// });

// // Create a new item
// app.post('/item', (req, res) => {
//     const { name, quantity, price } = req.body;
//     createItem(name, quantity, price, (err, data) => {
//         if (err) {
//             res.status(500).send(err.message);
//        } else {
//            res.status(201).send(`Item created with ID: ${data.id}`);
//        }
//     });
// });

// // Update an item (Fixed)
// app.put('/item/:id', (req, res) => {
//     const { name, quantity, price } = req.body;
//     updateItem(req.params.id, name, quantity, price, (err) => {
//         if (err) {
//             res.status(500).send(err.message);
//         } else {
//             res.status(200).send(`Updated successfully.`);
//         }
//     });
// });

// // Delete an item
// app.delete('/item/:id', (req, res) => {
//     deleteItem(req.params.id, (err) => {
//         if (err) {
//             res.status(500).send(err.message);
//         } else {
//             res.status(200).send(`Deleted successfully.`);
//         }
//     });
// });

// // Stock in an item
// app.post('/item/:id/stock-in', (req, res) => {
//     const { quantity } = req.body;
//     stockIn(req.params.id, quantity, (err) => {
//         if (err) {
//             res.status(500).send(err.message);
//         } else {
//             res.status(200).send(`Stocked in successfully.`);
//         }
//     });
// });

// // Sell an item
// app.post('/item/:id/sell', (req, res) => {
//     const { quantity } = req.body;
//     sellItem(req.params.id, quantity, (err) => {
//         if (err) {
//             res.status(500).send(err.message);
//         } else {
//             res.status(200).send(`Sold successfully.`);
//         }
//     });
// });

// // Manually remove stock
// app.post('/item/:id/remove', (req, res) => {
//     const { quantity } = req.body;
//     removeStock(req.params.id, quantity, (err) => {
//         if (err) {
//             res.status(500).send(err.message);
//         } else {
//             res.status(200).send(`Stock removed successfully.`);
//         }
//     });
// });

// // Start server
// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });
