const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId:{
        type:String,
        required:true,
    },
    orderItems:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"OrderItem",
        required:true, 
    },],
    shippingAddress: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
    }, totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    orderedDate: {
        type: Date,
        default: Date.now(),
    },
    shippedDate: {
        type: Date,
    },
    deliveredDate: {
        type: Date,
    },
    payment_method: {
        type: String,
        required: true,
    },
    totalPrice:{
        type:Number,
    },
    wallet:{
        type:Number,
        default:0
    },
    coupon:{
        type:Object,
    },
    discount:{
        type:Number,
    },
});

module.exports = mongoose.model("Order", orderSchema);
