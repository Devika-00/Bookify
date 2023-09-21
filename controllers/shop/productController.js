const asyncHandler = require("express-async-handler");
const Category = require("../../models/categoryModel")

/**shop psge
 * GET Method
 */
exports.shoppage = asyncHandler(async(req,res)=>{
    try {
        const category = await Category.find();
        res.render("shop/pages/products/shop",{title:"Shop Page",page:"shop", category});
    } catch (error) {
       throw new Error(error); 
    }
});

/**
 * Single Prodcut page Route
 * Method GET
 */
exports.singleProductpage = asyncHandler(async (req, res) => {
   try {
    res.render("shop/pages/products/product", {title: "Product", page: "Product "})
   } catch (error) {
    throw new Error(error)
   }
});
