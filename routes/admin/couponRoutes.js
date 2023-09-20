const express = require("express");
const router = express();

const couponController = require("../../controllers/admin/couponController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Coupon routes
router.get("/coupons", couponController.couponspage);
router.get("/add-coupon", couponController.addCoupon);

module.exports=router;