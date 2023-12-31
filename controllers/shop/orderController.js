const asyncHandler = require("express-async-handler");
const orderHelper = require("../../helper/orderHelper");
const pdfMake = require("pdfmake/build/pdfmake");
const vfsFonts = require("pdfmake/build/vfs_fonts");

/**
 * Orders Page Route
 * Method GET
 */
exports.orderspage = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await orderHelper.getOrders(userId);

        res.render("shop/pages/user/order", { title: "Orders", page: "orders" ,orders});
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Checkout Page Route
 * Method GET
 */
exports.singleOrder = asyncHandler(async(req,res)=>{
    try{
        const orderId = req.params.id;

        const{order,orders} =await orderHelper.getSingleOrder(orderId);
        
        res.render("shop/pages/user/single-order",{
            title:order.product.title,
            page:order.product.title,
            order,
            orders,
        });
    }catch(error){
        throw new Error(error)
    }
});

/**
 * cancel order
 * method Put
 */
exports.cancelOrder = asyncHandler(async(req,res)=>{
    try {
        const orderId = req.params.id;
        
        const result = await orderHelper.cancelOrderById(orderId);

        if(result === "redirectBack"){
            res.redirect("back");
        }else{
            res.json(result);
        }
    } catch (error) {
        throw new Error (error);
    }
});

/**
 * Cancel Single Order Route
 * Method PUT
 */
exports.cancelSingleOrder = asyncHandler(async(req,res)=>{
    try {
        const orderItemId = req.params.id;

        const result = await orderHelper.cancelSingleOrder(orderItemId,req.user._id);


        if(result === "redirectBack"){
            res.redirect("back");
        }else{
            res.json(result);
        }
    } catch (error) {
        throw new Error(error);
    }
});

/** return order 
 * method Post
 */
exports.returnOrder = asyncHandler(async(req,res)=>{
    try {
        const returnOrderItemId = req.params.id;
        const result = await orderHelper.returnOrder(returnOrderItemId);

        if(result === "redirectBack"){
            res.redirect("back");
        }else{
            res.json(result);
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Download Invoice
 * Method GET
 */
exports.donwloadInvoice = asyncHandler(async(req,res)=>{
    try {
        const orderId = req.params.id;

        const data = await orderHelper.generateInvoice(orderId);
        pdfMake.vfs = vfsFonts.pdfMake.vfs;

        const pdfDoc = pdfMake.createPdf(data);

        pdfDoc.getBuffer((buffer)=>{
            res.setHeader("Content-Type","application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=invoices.pdf`);

            res.end(buffer);
        });
    } catch (error) {
        throw new Error(error);
    }
});