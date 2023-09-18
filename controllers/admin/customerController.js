const asyncHandler = require("express-async-handler");

/**
 * Customer Page Route
 * Method GET
 */
exports.customerpage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/customer/customers", { title: "Customer" });
    } catch (error) {
        throw new Error(error);
    }
});