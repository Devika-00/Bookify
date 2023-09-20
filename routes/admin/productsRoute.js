const express = require("express");
const router = express();

const productController = require("../../controllers/admin/productController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Product Routes
router.get("/products", productController.productspage);
router.get("/add-product", productController.addProductpage);
router.get("/edit-product", productController.editProductpage);

module.exports=router;