
const express = require("express");
const {
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
} = require("./crud.js");

module.exports = function (app) {
    app.use(express.json());

    // PRODUCT ROUTES
    app.post("/api/products", createProduct);
    app.get("/api/products", getAllProducts);
    app.put("/api/products/:productId", updateProduct);

    // STORE ROUTES
    app.get("/api/stores", getAllStores);
    app.get("/api/stores/:storeId/stock", getStoreStock);
    app.post("/api/stores/:storeId/products/:productId/stock-in", stockIn);
    app.post("/api/stores/:storeId/products/:productId/sell", sellProduct);
    app.post("/api/stores/:storeId/products/:productId/remove", removeStock);

    // REPORTING ROUTES
    app.get("/api/stores/:storeId/inventory", getInventoryByDate);
    app.get("/api/stores/:storeId/sales", getTopSellingProducts);
    app.get("/api/stores/:storeId/low-stock", getLowStockProducts);
    app.get("/api/stores/:storeId/total-sales", getTotalSales);
};

