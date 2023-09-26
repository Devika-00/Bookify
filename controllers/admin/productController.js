const asyncHandler = require("express-async-handler");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const validateMongoDbId = require("../../utils/validateMongoDbId");

/**
 * Manage Product Page Route
 * Method GET
 */
exports.productspage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const products = await Product.find().populate("category")
        // res.json(products)
        res.render("admin/pages/products/product", { title: "Products" ,messages,products});
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Product Page Route
 * Method GET
 */
exports.addProductpage = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find({ isListed: true });
        res.render("admin/pages/products/add-product", { title: "Add Products",categories });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Product Page Route
 * Method GET
 */
exports.editProductpage = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDbId(id);
        const categories = await Category.find({ isListed: true });
        const product = await Product.findById(id).populate("category");
        res.render("admin/pages/products/edit-product", { title: "Edit Products",categories,product });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * add product route
 * method post
 */
exports.createProduct = asyncHandler(async(req,res) => {
    try {
        const newProduct = await Product.create({
            title: req.body.title,
            category: req.body.category,
            description: req.body.description,
            productPrice: req.body.productPrice,
            salePrice: req.body.salePrice,
            image: req.body.image,
            quantity: req.body.quantity,
        });
        req.flash("success", `${newProduct.title} added`);
        res.redirect("/admin/product");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Product Route
 * Method PUT
 */
exports.updateProduct = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const editedProduct = await Product.findByIdAndUpdate(id, req.body);
        req.flash("success", `Product ${editedProduct.title} updated`);
        res.redirect("/admin/product/products");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * List Product Route
 * Method PUT
 */
exports.listProduct = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, { isListed: true });
        req.flash("success", `${updatedProduct.title} Listed`);
        res.redirect("/admin/product/products");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Unlist Product Route
 * Method PUT
 */
exports.unlistProdcut = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, { isListed: false });
        req.flash("warning", `${updatedProduct.title} Unllisted`);
        res.redirect("/admin/product/products");
    } catch (error) {
        throw new Error(error);
    }
});
