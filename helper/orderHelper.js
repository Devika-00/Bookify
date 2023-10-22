const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const OrderItem = require("../models/orderItemModel");
const { status } = require("../utils/status");
const Wallet = require("../models/walletModel");
const WalletTransaction = require("../models/walletTransactionModel");
const { returnOrder } = require("../controllers/shop/orderController");

/**
 * get orders from user
 */
exports.getOrders = asyncHandler(async (userId) => {
  const orders = await Order.find({ user: userId })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: {
          path: "images",
        },
      },
    })
    .select("orderId orderedDate shippingAddress city")
    .sort({ _id: -1 });

  return orders;
});

/**
 * get a single order by Id
 */
exports.getSingleOrder = asyncHandler(async (orderId) => {
  const order = await OrderItem.findById(orderId).populate({
    path: "product",
    model: "Product",
    populate: {
      path: "images",
      model: "Images",
    },
  });
  const orders = await Order.findOne({ orderItems: orderId })
  return { order, orders };
});

//cancel an order by id
exports.cancelOrderById = asyncHandler(async (orderId) => {
  const order = await Order.findById(orderId).populate("orderItems");

  if (order.orderItems.every((item) => item.status === status.cancelled)) {
    return { message: "order is already cancelled" };
  }
  if (
    order.payment_method === "online_payment" &&
    order.orderItems.every((item) => {
      return item.ispaid === "pending" ? false : true;
    })
  ) {
    for (const item of order.orderItems) {
      const OrderItem = await OrderItem.findByIdAndUpdate(item._id, {
        status: status.cancelled,
      });
      const cancelledProduct = await Product.findById(OrderItem.product);
      cancelledProduct.quantity += OrderItem.quantity;
      cancelledProduct.sold -= OrderItem.quantity;
      await cancelledProduct.save();  
    }

    //updating order status
    order.status = status.cancelled;
    const updatedOrder = await order.save();

    return updatedOrder;
  } else if (order.payment_method === "cash_on_delivery") {
    for (const item of order.orderItems) {
      await OrderItem.findByIdAndUpdate(item._id, {
        status: status.cancelled,
      });
      const cancelledProduct = await Product.findById(item.product);
      cancelledProduct.quantity += item.quantity;
      cancelledProduct.sold -= item.quantity;
      await cancelledProduct.save();
    }

    order.status = status.cancelled;
    await order.save();

    return "redirectBack";
  }
});

//cancel single order

exports.cancelSingleOrder = asyncHandler(async (orderItemId, userId) => {
  const updatedOrder = await OrderItem.findByIdAndUpdate(orderItemId, {
    status: status.cancelled,
  });
  if (updatedOrder.isPaid !== "pending") {
    const cancelledProduct = await Product.findById(updatedOrder.product);
    cancelledProduct.quantity += updatedOrder.quantity;
    cancelledProduct.sold -= updatedOrder.quantity;
    await cancelledProduct.save();
  }

  const orders = await Order.findOne({ orderItems: orderItemId });

  if (
    (orders.payment_method === "online_payment" ||
      orders.payment_method === "wallet_payment") &&
    updatedOrder.isPaid === "paid"
  ) {
    const wallet = await Wallet.findOne({ user: userId });
    const orderTotal = parseInt(updatedOrder.price) * updatedOrder.quantity;
    const order = await Order.findOne({ orderItems: orderItemId });
    const appliedCoupon = order.coupon;

    let amountToBeRefunded = 0;
    if (appliedCoupon) {
      const returnAmount =
        orderTotal - (orderTotal * appliedCoupon.value) / 100;
      amountToBeRefunded = returnAmount;

      const existingWallet = await Wallet.findOneAndUpdate({ user: userId });
      existingWallet.balance += amountToBeRefunded;
      existingWallet.save();

      const walletTransaction = await WalletTransaction.create({
        wallet: existingWallet._id,
        amount: amountToBeRefunded,
        type: "credit",
      });
    } else {
      amountToBeRefunded = orderTotal;

      const existingWallet = await Wallet.findOneAndUpdate({user:userId});
      existingWallet.balance += amountToBeRefunded;
      existingWallet.save();

      const walletTransaction = await WalletTransaction.create({
        wallet:existingWallet._id,
        amount:amountToBeRefunded,
        type:"credit",
      });
    }
  }
  return "redirectBack";
});

//returnOrder:

exports.returnOrder = asyncHandler(async(returnOrderItemId)=>{
  const returnOrder = await OrderItem.findByIdAndUpdate(returnOrderItemId,{
    status:status.returnPending,
  });
  return "redirectBack";
});


