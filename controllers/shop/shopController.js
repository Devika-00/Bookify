const asyncHandler = require("express-async-handler");
const Product = require("../../models/productModel")

/**Home Page
 * GET Method
 */
exports.homepage = asyncHandler(async (req,res)=>{
    try {
        const products = await Product.find({isListed: true}).populate("images").populate("category");
        const bestProducts = await Product.find({isListed:true}).populate("images").populate("category").limit(4);
        res.render("shop/pages/index",{title:"Books World", page:"home", products, bestProducts});
    } catch (error) {
        throw new error(error);
    }
});

/** Contact Page
 * GET Method
 */
exports.contactpage = asyncHandler(async(req,res)=>{
    try {
        res.render("shop/pages/contact",{title:"Contacts", page:"contact"});
    } catch (error) {
        throw new error(error);
    }
});

/**About Page
 * GET Method
 */
exports.aboutpage = asyncHandler(async(req,res)=>{
    try {
        res.render("shop/pages/about",{title:"About-us",page:"about"});
    } catch (error) {
        throw new error(error);
    }
});
