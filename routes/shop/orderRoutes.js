const express = require ('express');
const router = express.Router();

const orderController=require("../../controllers/shop/orderController");

router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

// Order routes
router.get("/orders", orderController.orderspage);
router.get("/order-completed", orderController.orderCompletedpage);

module.exports= router;