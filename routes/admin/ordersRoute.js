const express = require("express");
const router = express();

const orderController = require("../../controllers/admin/orderController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Order Routes
router.get("/orders", orderController.ordersPage);
router.get("/edit-order", orderController.editOrder);

module.exports=router;