const express = require ('express');
const shopController =require("../../controllers/shop/shopController");
const productController=require("../../controllers/shop/productController");
const authController = require("../../controllers/shop/authController");
const userControler=require("../../controllers/shop/userController");
const orderController=require("../../controllers/shop/orderController");
const cartController=require("../../controllers/shop/cartController");
const router = express.Router();

router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

router.get("/",shopController.homepage);
router.get("/contact",shopController.contactpage);
router.get("/about",shopController.aboutpage);

//product route
router.get("/shop",productController.shoppage);

//Auth route
router.get("/login",authController.loginpage);
router.get("/register",authController.registerpage);
router.get("/forgot-password", authController.forgotPasswordpage);
router.get("/forgot-password-success", authController.forgotPasswordSuccesspage);

//User routes
router.get("/wishlist", userControler.wishlistpage);
router.get("/profile", userControler.profilepage);
router.get("/address", userControler.addresspage);
router.get("/checkout", userControler.checkoutpage);
router.get("/add-address", userControler.addAddresspage);

// Order routes
router.get("/orders", orderController.orderspage);
router.get("/order-completed", orderController.orderCompletedpage);

//Cart routes
router.get("/cart",cartController.cartpage);

module.exports= router;