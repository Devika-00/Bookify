const asyncHandler = require("express-async-handler");

/**Login route
 * GET Method
 */
exports.loginpage = asyncHandler(async(req,res)=>{
    try {
        res.render("shop/pages/auth/login",{title:"Login", page:"login"});
    } catch (error) {
        throw new Error(error);
    }
});

/**Register route
 * GET Method
 */
exports.registerpage = asyncHandler(async(req,res)=>{
    try {
        res.render("shop/pages/auth/register",{title:"Register", page:"register"});
    } catch (error) {
        throw new Error(error);
    }
});

/**Forgot-Password
 * GET Method
 */
exports.forgotPasswordpage = asyncHandler(async(req,res)=>{
    try {
        res.render("shop/pages/auth/forgot-password",{title:"Forgot-Password", page:"forgot-password"});
    } catch (error) {
        throw new Error(error);
    }
});

/**Forgot-Password-uccess
 * GET Method
 */
exports.forgotPasswordSuccesspage = asyncHandler(async(req,res)=>{
    try {
        res.render("shop/pages/auth/forgot-password-success",{title:"Forgot-Password-success", page:"forgot-password-success"});
    } catch (error) {
        throw new Error(error);
    }
});