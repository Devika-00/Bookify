const express = require("express");
const router = express();

const couponController = require("../../controllers/admin/couponController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Coupon routes
router.get("/", couponController.couponspage);
router.get("/add", couponController.addCoupon);
router.get("/edit/:id",couponController.editCouponPage);

router.post("/add", couponController.createCoupon);
router.post("/edit/:id",couponController.updateCoupon);
router.delete("/delete/:id",couponController.deleteCoupon);

module.exports=router;