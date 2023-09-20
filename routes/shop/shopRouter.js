const express = require ('express');
const router = express.Router();


const shopController =require("../../controllers/shop/shopController");
const productController=require("../../controllers/shop/productController");
const cartController=require("../../controllers/shop/cartController");


router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

router.get("/",shopController.homepage);
router.get("/contact",shopController.contactpage);
router.get("/about",shopController.aboutpage);

//product route
router.get("/shop",productController.shoppage);
router.get("/product/:id", productController.singleProductpage);

//Cart routes
router.get("/cart",cartController.cartpage);

module.exports= router;