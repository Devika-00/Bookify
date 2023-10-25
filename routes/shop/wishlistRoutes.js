const express = require("express");
const router = express.Router();
const wishlistController = require("../../controllers/shop/wishlistController");

router.get("/",wishlistController.wishlistpage);
router.get("/toggle/:id", wishlistController.toggleWishlist);
router.get("/remove/:id", wishlistController.removeFromWishlist);

module.exports = router;