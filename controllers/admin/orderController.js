const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const OrderItem = require("../../models/orderItemModel");
const Product = require("../../models/productModel");
const status = require("../../utils/status");
const { parse } = require("dotenv");
const Wallet = require("../../models/walletModel");
const WalletTransaction = require("../../models/walletTransactionModel");

/**
 * Manage Orders Page Route
 * Method GET
 */
exports.ordersPage = asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find().populate({
            path:"orderItems",
            populate:{
                path:"product",
                populate:{
                    path:"images",
                }
            }
        })

        .sort({orderedDate: -1});

        res.render("admin/pages/order/orders", { title: "Orders",orders });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Order Page Route
 * Method GET
 */
exports.editOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findOne({orderId:orderId}).populate({
            path:"orderItems",
            modal:"OrderItems",
            populate:{
                path:"product",
                modal:"Product",
                populate:{
                    path:"images",
                    modal:"Images",
                }
            }
        }).populate({
            path:"user",
            modal:"User",
        });
        res.render("admin/pages/order/edit-order", { title: "Edit Order" , order });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * udate order page
 * method put
 */
exports.updateOrderStatus = asyncHandler(async(req,res)=>{
    try {
        const orderId = req.params.id;

        const order = await OrderItem.findByIdAndUpdate(orderId,{
            status:req.body.status,
        });

        if(req.body.status === status.status.shipped){
            order.shippedDate = Date.now();
        }else if(req.body.status === status.status.delivered){
            order.deliveredDate = Date.now();
        }
        await order.save();

        if(req.body.status === status.status.cancelled){
            if(order.isPaid !== "pending"){
                const product = await Product.findById(order.product);
                product.sold -= order.quantity;
                product.quantity += order.quantity;
                await product.save();
            }

            const orders = await Order.findOne({orderItems: order._id});
            const wallet = await Wallet.findOne({user:orders.user});
            
            if(order.isPaid){
                const orderTotal = parseInt(order.price * order.quantity);
                let amountToBeRefunded = 0;
                if(orders.coupon){
                    const appliedCoupon = orders.coupon; 
                    const returnAmount = orderTotal -(orderTotal * appliedCoupon.value) /100;
                    amountToBeRefunded = returnAmount;
                

                   const existingWallet = await Wallet.findOneAndUpdate({user: orders.user});
                   existingWallet.balance += amountToBeRefunded;
                   existingWallet.save();
              
                   const walletTransaction = await WalletTransaction.create({
                   wallet:existingWallet._id,
                   amount:amountToBeRefunded,
                   type:"credit",
                  })
                }else{
                    amountToBeRefunded = orderTotal;

                    const existingWallet = await Wallet.findOneAndUpdate({user:orders.user});
                    existingWallet.balance += amountToBeRefunded;
                    existingWallet.save();

                    const walletTransaction = await WalletTransaction.create({
                        wallet:existingWallet._id,
                        amount:amountToBeRefunded,
                        type:"credit",
                    });
                }
            }
        }else if(order.status === status.status.returnPending){ 

            order.status = status.status.returned;
            await order.save()
            const product = await Product.findById(order.product);
            product.sold -= order.quantity;
            product.quantity += order.quantity;
            await product .save();

            const orders = await Order.findOne({orderItems:order._id});

            const wallet = await Wallet.findOne({user:order.user});
            let amountToBeRefunded = 0;
            const orderTotal = parseInt(order.price * order.quantity);
            if(orders.coupon){

                const appliedCoupon = orders.coupon;
                const returnAmount  = orderTotal - (orderTotal * appliedCoupon.value) / 100;
                amountToBeRefunded = returnAmount;

                const existingWallet = await Wallet.findOneAndUpdate({user:orders.user});
                existingWallet.balance += amountToBeRefunded;
                existingWallet.save();

                const walletTransaction = await WalletTransaction.create({
                    wallet:existingWallet._id,
                    amount:amountToBeRefunded,
                    type:"credit",
                });

            }else{
                amountToBeRefunded = orderTotal;

                const existingWallet = await Wallet.findOneAndUpdate({user:orders.user});
                existingWallet.balance += amountToBeRefunded;
                existingWallet.save();

                const walletTransaction = await WalletTransaction.create({
                    wallet:existingWallet._id,
                    amount:amountToBeRefunded,
                    type:"credit",
                });
            }
        }
        res.redirect("back");   
    } catch (error) {
        throw new Error(error)
    }
})