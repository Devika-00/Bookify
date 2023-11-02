const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const User = require("../../models/usermodel");
const {roles} = require("../../utils/constants");
const validateMongoDbId = require("../../utils/validateMongoDbId");
const Product = require("../../models/productModel");
const {status} = require("../../utils/status");
const numeral = require("numeral");

/**
 * Home Page Route
 * Method GET
 */
exports.homepage = asyncHandler(async (req, res) => {
    const admin = req.user
    try {
        if (admin) {
            res.redirect("/admin/dashboard");
        } else {
            res.redirect("/admin/auth/login");
        }
    } catch (error) {
        throw new Error(error);
    }
});


/**
 * Dashborad Page Route
 * Method GET
 */
exports.dashboardpage = asyncHandler(async (req, res) => {
    try {
        const user = req?.user;
        const recentOrders = await Order.find().limit(5).populate({
            path:"user",
            select:"firstName lastname",
        }).populate("orderItems").select("totalAmount orderDate totalPrice").sort({_id:-1});

        let totalSalesAmount = 0;
        recentOrders.forEach((order)=>{
            totalSalesAmount += order.totalPrice;
        });

        totalSalesAmount = numeral(totalSalesAmount).format("0.0a");

        const totalSoldProducts = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    total_sold_count: {
                        $sum: "$sold",
                    },
                },
            },
        ]);

        const totalOrderCount = await Order.countDocuments();
        const totalActiveUserCount = await User.countDocuments({ isBlocked: false });
        res.render("admin/pages/admin/dashboard", { title: "Dashboard",user,recentOrders,totalSalesAmount,totalOrderCount,totalActiveUserCount,totalSoldProducts: totalSoldProducts[0].total_sold_count, });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Settings Page Route
 * Method GET
 */
exports.settingspage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/admin/settings", { title: "Settings" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Sales Report Page Route
 * Method GET
 */
exports.salesReportpage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/admin/sales-report", { title: "Sales Report" });
    } catch (error) {
        throw new Error(error);
    }
});
/**
 * Generate Sales Report
 * Method POST
 */
exports.generateSalesReport = async (req, res, next) => {
    try {
        const fromDate = new Date(req.query.fromDate);
        const toDate = new Date(req.query.toDate);
        const salesData = await Order.find({
            orderedDate: {
                $gte: fromDate,
                $lte: toDate,
            },
        }).select("orderId totalPrice orderedDate payment_method -_id");

        res.status(200).json(salesData);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

/**
 * Get Sales Data
 * Method GET
 */
exports.getSalesData = async (req, res) => {
    try {
        const pipeline = [
            {
                $project: {
                    year: { $year: "$orderedDate" },
                    month: { $month: "$orderedDate" },
                    totalPrice: 1,
                },
            },
            {
                $group: {
                    _id: { year: "$year", month: "$month" },
                    totalSales: { $sum: "$totalPrice" },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $concat: [
                            { $toString: "$_id.year" },
                            "-",
                            {
                                $cond: {
                                    if: { $lt: ["$_id.month", 10] },
                                    then: { $concat: ["0", { $toString: "$_id.month" }] },
                                    else: { $toString: "$_id.month" },
                                },
                            },
                        ],
                    },
                    sales: "$totalSales",
                },
            },
        ];

        const monthlySalesArray = await Order.aggregate(pipeline);

        res.json(monthlySalesArray);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
