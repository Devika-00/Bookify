const express = require("express");
const router = express();

const adminController = require("../../controllers/admin/adminController");
const authController = require("../../controllers/admin/authController");
const productController = require("../../controllers/admin/productController");
const categoryController = require("../../controllers/admin/categoryController");
const bannerController = require("../../controllers/admin/bannerController");
const couponController = require("../../controllers/admin/couponController");
const customerController = require("../../controllers/admin/customerController");
const orderController = require("../../controllers/admin/orderController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

//Admin route
router.get("/", adminController.homepage);
router.get("/dashboard", adminController.dashboardpage);
router.get("/settings", adminController.settingspage);
router.get("/sales-report", adminController.salesReportpage);

// Auth Rotues
router.get("/login", authController.loginpage);
router.get("/register", authController.registerpage);

// Product Routes
router.get("/products", productController.productspage);
router.get("/add-product", productController.addProductpage);
router.get("/edit-product", productController.editProductpage);

// Category Routes
router.get("/categories", categoryController.categoriespage);
router.get("/add-category", categoryController.addCategorypage);

// Banner Routes
router.get("/banners", bannerController.bannerspage);
router.get("/add-banner", bannerController.addBannerpage);

// Coupon routes
router.get("/coupons", couponController.couponspage);
router.get("/add-coupon", couponController.addCoupon);

// Customer Routes
router.get("/customers", customerController.customerpage);


// Order Routes
router.get("/orders", orderController.ordersPage);
router.get("/edit-order", orderController.editOrder);


router.get("*", (req, res) => {
    res.render("admin/pages/404", { title: "404 Page" });
});


module.exports=router;
