const asyncHandler = require("express-async-handler");
const validateMongoDbId =require("../../utils/validateMongoDbId");
const User = require("../../models/usermodel");
const Product = require("../../models/productModel");
const Cart = require("../../models/cartModel");
const { incrementQuantity, decrementQuantity, calculateCartTotals } = require("../../helper/CartHelper");


/**
 * cart page 
 * get method
 */

exports.cartpage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const messages = req.flash();
    try {

        const cart = await Cart.findOne({user: userId}).populate({path:"products.product",populate:{path:"images",model:"Images"},}).exec();

        if(cart){
            const {subtotal,total,shippingfee} = calculateCartTotals(cart.products);
           
            res.render("shop/pages/user/cart",{title:"cart", page:"cart",cart,messages,subtotal,total,shippingfee});
        }else{

            res.render("shop/pages/user/cart", { title: "Cart", page: "cart",messages });
        }

    } catch (error) {
        throw new Error(error);
    }
});

/**
 * add to cart route
 * get method
 */
exports.addToCart = asyncHandler(async(req,res)=>{
    const productId = req.params.id;
    const userId = req.user.id;
    validateMongoDbId(productId);
    try {
        const product = await Product.findById(productId);

        if(!product){
            return res.status(404).json({message:"product not found"});
        }

        if(product.quantity<1){
            return res.status(404).json({message:"product is out of stock"});
        }

        let cart = await Cart.findOne({user:userId});

        if(!cart){
            cart = await Cart.create({user:userId, products:[{product:productId,quantity:1}],});
        }else{
            const existingProduct = cart.products.find((item)=> item.product.equals(productId));

        if(existingProduct){
            if(product.quantity <= existingProduct.quantity){
                return res.json({message:"out of stock",status:"danger",count:cart.products.length});
            }
            existingProduct.quantity += 1;
        }else{
            cart.products.push({product:productId,quantity:1});
        }

        await cart.save();
    }

    res.json({ message: "Product Added to Cart", count: cart.products.length, status: "success" });

    } catch (error) {
        throw new Error(error);
    }
});

/**remove route
 * get method
 */
exports.removeFromCart = asyncHandler(async(req,res)=>{
    const productId = req.params.id;
    const userId = req.user.id;
    validateMongoDbId(productId);
    try {
        const cart = await Cart.findOne({user:userId});
        if(cart){
            cart.products = cart.products.filter((product)=>product.product.toString() !== productId);
            await cart.save();
        }
        req.flash("warning",`item removed`);
        res.redirect("back");
    } catch (error) {
        
    }
});

/**
 * increment quantity route
 * get method
 */
exports.incQuantity = asyncHandler(async(req,res)=>{
    try {
        const productId = req.params.id;
        const userId = req.user._id;
        validateMongoDbId(productId);

        await incrementQuantity(userId, productId, res);
    } catch (error) {
        throw new Error(error)
    }
});

/**
 * Decrement Quantity Route
 * post method
 */
exports.decQuantity = asyncHandler(async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;
        validateMongoDbId(productId);

        await decrementQuantity(userId, productId, res);        

    } catch (error) {
        throw new Error(error);
    }
});