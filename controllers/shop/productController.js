const asyncHandler = require("express-async-handler");
const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const validateMongoDbId = require("../../utils/validateMongoDbId");

/**shop psge
 * GET Method
 */
exports.shoppage = asyncHandler(async(req,res)=>{
    try {
        const { page, perPage } = req.query;
        const messages = req.flash();
        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(perPage) || 8;
        const allProducts = await Product.find({isListed: true}).populate("images");
        const skip = (currentPage - 1) * itemsPerPage;
        const products = allProducts.slice(skip, skip + itemsPerPage);
        const category = await Category.find();
        const totalProductsCount = allProducts.length;
        res.render("shop/pages/products/shop",{title:"Shop Page",page:"shop", category,messages,products, currentPage, totalProductsCount, itemsPerPage});
    } catch (error) {
       throw new Error(error); 
    }
});

/**
 * Single Prodcut page Route
 * Method GET
 */
exports.singleProductpage = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
   try {
    const messages = req.flash();
    const product = await Product.findById(id).populate("images");
    const relatedProducts = await Product.find().populate("images");
    res.render("shop/pages/products/product", {title: "Product", page: "Product ",messages,product,relatedProducts})
   } catch (error) {
    throw new Error(error)
   }
});
