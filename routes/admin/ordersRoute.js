const express = require("express");
const router = express();

const orderController = require("../../controllers/admin/orderController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Order Routes
router.get("/", orderController.ordersPage);
router.get("/:id", orderController.editOrder);
router.put("/update/:id", orderController.updateOrderStatus);

module.exports=router;