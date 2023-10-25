
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongoDbId");
const User = require("../../models/usermodel");
const Product = require("../../models/productModel");

/**
 * Wishlist Page Route
 * Method GET
 */
exports.wishlistpage = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        // Ensure userId is valid and exists
        if (!userId) {
            return res.status(400).send("User ID is not valid.");
        }

        // Fetch the user and populate the wishlist
        const user = await User.findById(userId).populate("wishlist");

        // Check if user is null
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const populatedWishlist = await Product.populate(user.wishlist, { path: "images" });
        const messages = req.flash();
        res.render("shop/pages/user/wishlist", { title: "Wishlist", page: "wishlist", populatedWishlist, messages });
    } catch (error) {
        // Handle the error
        console.error("Error in wishlistpage:", error);
        res.status(500).send("Internal Server Error");
    }
});

/** Add to wishlist
 * get method
 */
exports.toggleWishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.id;
        validateMongoDbId(productId);

        const user = await User.findById(userId);

        // Check if user is null
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const isInWishlist = user.wishlist.includes(productId);


        if (isInWishlist) {
            user.wishlist = user.wishlist.filter((item) => item.toString() !== productId);
            await user.save();
            res.json({ message: "Product removed from wishlist", status: "danger", isInWishlist: false });
        } else {
            user.wishlist.push(productId);
            await user.save();
            res.json({ message: "Product added to wishlist", status: "success", isInWishlist: true });
        }

    } catch (error) {
        // Handle the error
        console.error("Error in addToWishlist:", error);
        res.status(500).send("Internal Server Error");
    }
});

/**
 * remove from wishlist
 * get method
 */
exports.removeFromWishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.id;
        validateMongoDbId(productId);

        const user = await User.findByIdAndUpdate(userId, {
            $pull: { wishlist: productId },
        });

        req.flash("warning", "Item removed");
        res.redirect("back");
        
    } catch (error) {
        throw new Error(error);
    }
});
