const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");

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
        res.render("admin/pages/admin/dashboard", { title: "Dashboard" });
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
