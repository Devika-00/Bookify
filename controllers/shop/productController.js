const asyncHandler = require("express-async-handler");
const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const validateMongoDbId = require("../../utils/validateMongoDbId");

/**shop psge
 * GET Method
 */
exports.shoppage = asyncHandler(async(req,res)=>{
    try {
        const queryOption = {isListed:true};
        const { page, perPage ,search,sortBy ,category} = req.query;
        const messages = req.flash();

        if (search) {
            queryOption.$or = [
                { title: { $regex: new RegExp(search, "i") } }
            ];
        }

        if (category) {
            queryOption.category = category;
        }


        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(perPage) || 8;
        const allProducts = await Product.find(queryOption).populate("images").populate("category").exec();
        const skip = (currentPage - 1) * itemsPerPage;
        const products = allProducts.slice(skip, skip + itemsPerPage);

        const sortOptions = {};
        if (sortBy === "az") {
            sortOptions.title = 1;
        } else if (sortBy === "za") {
            sortOptions.title = -1;
        } else if (sortBy === "price-asc") {
            sortOptions.salePrice = 1;
        } else if (sortBy === "price-desc") {
            sortOptions.salePrice = -1;
        }

        products.sort((a, b) => {
            if (sortOptions.title) {
                return a.title.localeCompare(b.title) * sortOptions.title;
            } else if (sortOptions.salePrice) {
                return (a.salePrice - b.salePrice) * sortOptions.salePrice;
            }
            return 0;
        });

        const categories = await Category.find({isListed:true});
        const totalProductsCount = allProducts.length;
        res.render("shop/pages/products/shop",{title:"Shop Page",page:"shop", categories,messages,products, currentPage, totalProductsCount, itemsPerPage,sortBy,search,category});
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
    const product = await Product.findById(id).populate("images").populate("category");
    const relatedProducts = await Product.find().populate("images");
    res.render("shop/pages/products/product", {title: "Product", page: "Product ",messages,product,relatedProducts})
   } catch (error) {
    throw new Error(error)
   }
});
