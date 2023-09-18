const asyncHandler = require("express-async-handler");
/**shop psge
 * GET Method
 */
exports.shoppage = asyncHandler(async(req,res)=>{
    try {
        res.render("shop/pages/products/shop",{title:"Shop Page",page:"shop"});
    } catch (error) {
       throw new Error(error); 
    }
});