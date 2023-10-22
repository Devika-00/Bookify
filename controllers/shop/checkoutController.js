const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongoDbId");
const User = require("../../models/usermodel");
const checkoutHelper = require("../../helper/checkoutHelper");
const Cart = require("../../models/cartModel");
const OrderItems = require("../../models/orderItemModel");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const Razorpay = require("razorpay");
const Coupon = require("../../models/couponModel");
const { check } = require("express-validator");

/**
 * checkout page
 * method post
 */
exports.checkoutpage = asyncHandler(async (req, res) => {
  try {
    const userid = req.user._id;
    const user = await User.findById(userid).populate("address");
    const cartItems = await checkoutHelper.getCartItems(userid);
    const cartData = await Cart.findOne({ user: userid });
    const availablecoupon = await Coupon.find({
      expiryDate: { $gt: Date.now() },
    })
      .select({ code: 1, _id: 0 })
      .limit(2);

    let couponmessages = {};
    const coupons = availablecoupon.map((coupon) => coupon.code).join(" | ");
    couponmessages = { status: "text-info", message: "Try " + coupons };

    console.log(couponmessages);

    if (cartItems) {
      const { subtotal, shippingfee, total,discount } =
        checkoutHelper.calculateTotalPrice(cartItems);
      res.render("shop/pages/user/checkout", {
        title: "Checkout",
        page: "checkout",
        address: user.address,
        product: cartItems.products,
        total,
        subtotal,
        shippingfee,
        cartData,
        couponmessages,
        discount,
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * place order page
 * method post
 */
exports.placeOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId, payment_method, code} = req.body;

    const newOrder = await checkoutHelper.placeOrder(
      userId,
      addressId,
      payment_method,
      code,
    );

    if (payment_method === "cash_on_delivery") {
      res.status(200).json({
        message: "Order placed successfully",
        orderId: newOrder._id,
      });
    } else if (payment_method === "online_payment") {
      const user = await User.findById(req.user._id);

      var instance = new Razorpay({
        key_id: process.env.RAZORPAY_ID_KEY,
        key_secret: process.env.RAZORPAY_SECRET_KEY,
      });

      const rzp_order = instance.orders.create(
        {
          amount: newOrder.totalPrice * 100,
          currency: "INR",
          receipt: newOrder.orderId,
        },

        (err, order) => {
          if (err) {
            res.status(500).json(err);
          } else {
            res.status(200).json({
              message: "Order placed successfully",
              rzp_order,
              order,
              user,
              orderId: newOrder._id,
            });
          }
        }
      );
    } else {
      res.status(400).json({ message: "invalid payment method" });
    }
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * get cart data
 * get method
 */
exports.getCartData = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const cartData = await Cart.findOne({ user: userId });
    res.json(cartData);
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Order Placed
 * Method GET
 */
exports.orderPlaced = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    const coupon = (await Coupon.findOne({}))
    const order = await Order.findById(orderId).populate({
      path: "orderItems",
      populate: {
        path: "product",
      },
    });
    const cartItems = await checkoutHelper.getCartItems(req.user._id);

    if (order.payment_method === "cash_on_delivery") {
      for (const item of order.orderItems) {
        item.isPaid = "cod";
        await item.save();
      }
    } else if (order.payment_method === "online_payment") {
      for (const item of order.orderItems) {
        item.isPaid = "paid";
        await item.save();
      }
    }

    if (cartItems) {
      for (const cartItem of cartItems.products) {
        const updateProduct = await Product.findById(cartItem.product._id);
        updateProduct.quantity -= cartItem.quantity;
        updateProduct.sold += cartItem.quantity;
        await updateProduct.save();
({})
        await Cart.findOneAndDelete({ user: req.user._id });
      }
    }
    res.render("shop/pages/user/order-placed", {
      title: "order placed",
      page: "order placed",
      order: order,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//verify payment
//post method
exports.verifyPayment = asyncHandler(async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
      userId,
    } = req.body;
    const result = await checkoutHelper.verifyPayment(
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId
    );
    res.json(result);
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Coupon route
 * Method POST
 */
exports.updateCoupon = asyncHandler(async (req, res) => {
  try {
    const userid = req.user._id;
    const coupon = await Coupon.findOne({
      code: req.body.code,
      expiryDate: { $gt: Date.now() },
    });

    const cartItems = await checkoutHelper.getCartItems(userid);
    const availableCoupons = await Coupon.find({
      expiryDate: { $gt: Date.now() },
      usedBy: { $nin: [userid] },
    })
      .select({ code: 1, _id: 0 })
      .limit(2);

    const { subtotal, total, discount } =
      await checkoutHelper.calculateTotalPrice(cartItems, userid, coupon);


    if (!coupon) {
      const coupons = availableCoupons.map((coupon) => coupon.code).join(" | ");
      res.status(202).json({
        status: "info",
        message: "Try" + coupons,
        subtotal,
        total,
        discount,
      });
    } else if (coupon.usedBy.includes(userid)) {
      res.status(202).json({
        status: "danger",
        messages: "The coupon is already used",
      });
    } else if (subtotal < coupon.minAmount) {
      res.status(200).json({
        status: "danger",
        message: `You need to spend at least ${coupon.minAmount} to get this offer.`,
      });
    } else {
      res.status(200).json({
        status: "success",
        messages: `${coupon.code} applied`,
        coupon: coupon,
        subtotal,
        total,
        discount,
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});


