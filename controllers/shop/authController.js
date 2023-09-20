const asyncHandler = require("express-async-handler");
const User = require("../../models/usermodel");
const {body, validationResult} = require("express-validator");

/**Login route
 * GET Method
 */
exports.loginpage = asyncHandler(async(req,res)=>{
    try {
        const messages = req.flash()
        res.render("shop/pages/auth/login",{title:"Login", page:"login", messages});
    } catch (error) {
        throw new Error(error);
    }
});



/**Register route
 * GET Method
 */
exports.registerpage = asyncHandler(async(req,res)=>{
    try {
        const messages = req.flash();
        res.render("shop/pages/auth/register",{title:"Register", page:"register", messages});
    } catch (error) {
        throw new Error(error);
    }
});

/**Register
 * post method
 */
exports.registerUser = asyncHandler(async (req, res) => {
   try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash("danger", error.msg);
        });
        const messages = req.flash();
        res.render("shop/pages/auth/register", { title: "Register", page: "Login", messages, data: req.body });
    } else {
        const email = req.body.email;
        const existingUser = await User.findOne({email: email});

        if (!existingUser) {
            const newUser = await User.create(req.body);
            req.flash("success", "User Registerd Successfully Please Login");
                res.redirect("/auth/login");
            
        } else {
            req.flash("warning", "Email Alardy Registerd Please login");
                res.redirect("/auth/login");
            
        }
    }
   } catch (error) {
    throw new Error(error) 
   }
});


/**
 * Logout Route
 * Method GET
 */
exports.logoutUser = asyncHandler(async (req, res, next) => {
    try {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Logged Out!");
            res.redirect("/auth/login");
        });
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