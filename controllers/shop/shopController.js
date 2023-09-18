const asyncHandler = require("express-async-handler");

/**Home Page
 * GET Method
 */
exports.homepage = asyncHandler(async (req,res)=>{
    try {
        res.render("shop/pages/index",{title:"Books World", page:"home"});
    } catch (error) {
        throw new error(error);
    }
});

/** Contact Page
 * GET Method
 */
exports.contactpage = asyncHandler(async(req,res)=>{
    try {
        res.render("shop/pages/contact",{title:"Contacts", page:"contact"});
    } catch (error) {
        throw new error(error);
    }
});

/**About Page
 * GET Method
 */
exports.aboutpage = asyncHandler(async(req,res)=>{
    try {
        res.render("shop/pages/about",{title:"About-us",page:"about"});
    } catch (error) {
        throw new error(error);
    }
});
