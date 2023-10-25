const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const OrderItems = require("../models/orderItemModel");
const User = require("../models/usermodel");
const Order = require("../models/orderModel");
const Address = require("../models/addressamodel");
const { generateUniqueOrderID } = require("../utils/generateUniqueid");
const Crypto = require("crypto");
const Coupon = require("../models/couponModel");
const Wallet = require("../models/walletModel");
const WalletTransaction = require("../models/walletTransactionModel");

/**
 * get user's cart items
 */
exports.getCartItems = asyncHandler(async (userId) => {
  return await Cart.findOne({ user: userId }).populate("products.product");
});

/**
 * Calculate the total price of cart items
 */
// exports.calculateTotalPrice = asyncHandler(async (CartItems, userid, payWithWallet, coupon) => {
//   try {
//     const wallet = await Wallet.findOne({ user: userid });

//     if (!wallet) {
//       // Handle the case when the wallet is not found for the user.
//       return { error: "Wallet not found" };
//     }

//     let subtotal = 0;
//     for (const product of CartItems.products) {
//       const productTotal = parseFloat(product.product.salePrice) * product.quantity;
//       subtotal += productTotal;
//     }

//     let shippingfee = 40;
//     if (subtotal > 499) {
//       shippingfee = 0;
//     }

//     let total = subtotal;
//     let discount = 0;
//     let usedFromWallet = 0;

//     if (payWithWallet) {
//       if (coupon) {
//         if (coupon.value === 'number' && coupon.maxAmount === 'number') {
//           discount = Math.round((total * coupon.value) / 100, coupon.maxAmount);
//         }

//         total -= discount;
//       }

//       if (total <= wallet.balance) {
//         usedFromWallet = total;
//         wallet.balance -= total;
//         total = 0;
//       } else {
//         usedFromWallet = wallet.balance;
//         total -= wallet.balance;
//         wallet.balance = 0;
//       }
//     }

//     return {
//       subtotal,
//       total,
//       usedFromWallet,
//       shippingfee,
//       walletBalance: wallet.balance,
//       discount,
//     };
//   } catch (err) {
//     // Handle any database or other errors that might occur during the calculation.
//     return { error: err.message };
//   }
// });

exports.calculateTotalPrice = asyncHandler(
  async (cartItems, userid, payWithWallet, coupon) => {
    console.log({coupon});
    const wallet = await Wallet.findOne({ user: userid });
    let subtotal = 0;
    for (const product of cartItems.products) {
      const productTotal =
        parseFloat(product.product.salePrice) * product.quantity;
      subtotal += productTotal;
    }

    let shippingfee = 40;
         if (subtotal > 499) {
           shippingfee = 0;
         }

    let total;
    let usedFromWallet = 0;
    if (wallet && payWithWallet) {
      let discount = 0;
      total = subtotal;

      if (coupon) {
        discount = ((total * coupon.value) / 100).toFixed(2);
        if (discount > coupon.maxAmount) {
          discount = coupon.maxAmount;
          total -= discount + shippingfee;
        } else {
          total -= discount + shippingfee;
        }
      }

      if (total <= wallet.balance) {
        usedFromWallet = total;
        wallet.balance -= total;
        total = 0;
      } else {
        usedFromWallet = wallet.balance;
        total = subtotal - wallet.balance - discount + shippingfee;
        wallet.balance = 0;
      }
      return {
        subtotal,
        total,
        usedFromWallet,
        walletBalance: wallet.balance,
        discount: discount ? discount : 0,
      };
    } else {
      total = subtotal;
      let discount = 0;
      if (coupon) {
        discount = ((total * coupon.value) / 100).toFixed(2);
        if (discount > coupon.maxAmount) {
          discount = coupon.maxAmount;
          total -= discount + shippingfee;
        } else {
          total -= discount + shippingfee;
        }
      }
      return {
        subtotal,
        total,
        usedFromWallet,
        walletBalance: wallet ? wallet.balance : 0,
        discount: discount ? discount : 0,
      };
    }
  }
);

/**
 * Place an order
 */
exports.placeOrder = asyncHandler(
  async (userId, addressId, payment_method, code, isWallet, coupons) => {
    const cartItems = await exports.getCartItems(userId);
    const coupon = await Coupon.findOne({ code: code });

    if (!cartItems) {
      throw new Error("cart not found");
    }
    const orders = [];
    let total = 0;

    for (const cartItem of cartItems.products) {
      const productTotal =
        parseFloat(cartItem.product.salePrice) * cartItem.quantity;

      let shippingfee = 40;
      if (productTotal > 499) {
        shippingfee = 0;
      }

      total = total + productTotal + shippingfee;

      const item = await OrderItems.create({
        quantity: cartItem.quantity,
        price: cartItem.product.salePrice,
        product: cartItem.product._id,
      });
      orders.push(item);
    }
    let discount;
    if (coupon) {
      discount = ((total * coupon.value) / 100).toFixed(2);
      if (discount > coupon.maxAmount) {
        discount = coupon.maxAmount;
        total = total - discount + shippingfee;
      } else {
        total = total - discount + shippingfee;
      }
    }
    // const updateProduct = await Product.findById(cartItem.product._id);
    // updateProduct.quantity -= cartItem.quantity;
    // updateProduct.sold += cartItem.quantity;
    // await updateProduct.save();

    const address = await Address.findById(addressId);

    const existingOrderIds = await Order.find().select("orderId");
    //Create the order
    const newOrder = await Order.create({
      orderId: "OD" + generateUniqueOrderID(existingOrderIds),
      user: userId,
      orderItems: orders,
      shippingAddress: address.name,
      city: address.city,
      street: address.street,
      state: address.state,
      zip: address.pincode,
      phone: address.mobile,
      totalPrice: total,
      payment_method: payment_method,
      coupon: coupon,
      discount: discount,
    });
    return newOrder;
  }
);

/**
 * Verify payment using Razorpay
 */
exports.verifyPayment = asyncHandler(
  async (
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    orderId
  ) => {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = Crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_SECRET_KEY
    )
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      console.log(true);
      return { message: "success", orderId: orderId };
    } else {
      throw new Error("Payment verification failed");
    }
  }
);
