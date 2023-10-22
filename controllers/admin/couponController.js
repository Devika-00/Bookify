const asyncHandler = require("express-async-handler");
const Coupon = require("../../models/couponModel");
const { parse } = require("dotenv");
const validateMongoDbId = require("../../utils/validateMongoDbId");

/**
 * Manage Coupon Page Route
 * Method GET
 */
exports.couponspage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const coupons = await Coupon.find().sort({_id:1});
        res.render("admin/pages/coupon/coupons", { title: "Coupons", messages,coupons });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Coupon Page Route
 * Method GET
 */
exports.addCoupon = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        res.render("admin/pages/coupon/add-coupon", { title: "Add Coupon" ,messages,data:{}});
    } catch (error) {
        throw new Error(error);
    }
});


/**
 * add coupon 
 * post method
 */
exports.createCoupon = asyncHandler(async(req,res)=>{
    try {
        const existingCoupon = await Coupon.findOne({code:req.body.code});

        if(!existingCoupon){
            const newCoupon = await Coupon.create({
                code:req.body.code,
                type:req.body.type,
                value:parseInt(req.body.value),
                description:req.body.description,
                expiryDate:req.body.expiryDate,
                minAmount:parseInt(req.body.minAmount),
                maxAmount:parseInt(req.body.maxAmount),

            });
            res.redirect("/admin/coupons");
        }
        req.flash("warning","Coupon exists with same code");
        res.render("admin/pages/coupon/add-coupon",{title:"Add coupon",data:req.body});
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * edit page
 * get method
 */
exports.editCouponPage = asyncHandler(async(req,res)=>{
    try {
        const couponId = req.params.id;
        const coupon = await Coupon.findById(couponId);
        const couponTypes = await Coupon.distinct("type");
        const messages = req.flash();
        res.render("admin/pages/coupon/edit-coupon",{title:"Edit Coupon",coupon,couponTypes,messages});
    } catch (error) {
        throw new Error (error);
    }
});

/**
 * update coupon
 * post method
 */
exports.updateCoupon = asyncHandler(async (req, res) => {
    try {
        const couponId = req.params.id;
        const isExists = await Coupon.findOne({ code: req.body.code, _id: { $ne: couponId } });

        if (!isExists) {
            const updtedCoupon = await Coupon.findByIdAndUpdate(couponId, req.body);
            req.flash("success", "Coupon Updated");
            res.redirect("/admin/coupons");
        } else {
            req.flash("warning", "Coupon Already Exists");
            res.redirect("back");
        }
    } catch (error) {}
});

/**
 * delete coupon
 * method delete
 */
exports.deleteCoupon = asyncHandler(async(req, res)=>{
    try {
        const id  = req.params.id;
        validateMongoDbId(id);
        const deletecoupon = await Coupon.findByIdAndDelete(id);
        res.redirect("/admin/coupons");
    } catch (error) {
        throw new Error (error);
    }
});