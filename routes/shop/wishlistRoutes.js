const express = require("express");
const router = express.Router();
const wishlistController = require("../../controllers/shop/wishlistController");

router.get("/",wishlistController.wishlistpage);
router.get("/add/:id", wishlistController.addToWishlist);
router.get("/remove/:id", wishlistController.removeFromWishlist);

module.exports = router;