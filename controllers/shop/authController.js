const asyncHandler = require("express-async-handler");
const User = require("../../models/usermodel");
const {body, validationResult} = require("express-validator");
const otpGenerator = require("../../utils/otpGenerator");
const emailSender = require("../../utils/emailSender");
const Otp = require("../../models/otpModel");
const generateOTP = require("../../utils/otpGenerator");
const sendEmail = require("../../utils/emailSender");

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
            const otp = await Otp.create({
                user_id: newUser._id,
                user_email: newUser.email,
                otp_code: generateOTP(),
                expiration_time: Date.now() + 5 * 60 * 1000,
            })

            try {
                const html = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Verification</title>
                </head>
                <body>
                    <table cellspacing="0" cellpadding="0" width="100%">
                        <tr>
                            <td align="center" style="background-color: #f4f4f4; padding: 40px 0;">
                                <table cellspacing="0" cellpadding="0" width="600" style="background-color: #ffffff; border-radius: 6px; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
                                    <tr>
                                        <td style="text-align: center; padding: 30px;">
                                            <h2>Verify Your Email Address</h2>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center; padding: 20px;">
                                            <p>Dear ${newUser.firstName},</p>
                                            <p>Thank you for registering with Bookify! To complete the registration process and ensure the security of your account, please verify your email address.</p>
                                            <p>Here is your one-time verification code:</p>
                                            <p style="font-size: 24px; font-weight: bold;">OTP Code: ${otp.otp_code}</p>
                                            <p>Please use this code within the next 5 minutes to confirm your email address. If you do not verify your email within this time frame, you will need to request a new OTP.</p>
                                            <p>If you did not sign up for an account with Bookify, please disregard this email.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center; padding: 30px;">
                                            <p>Thank you for choosing Bookify. We look forward to serving you!</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>`

                await sendEmail({
                    email: newUser.email,
                    subject: "Email Verification",
                    html: html
                })

                req.flash("success", "Email send please check your inbox");
                return res.redirect("/auth/verify-otp")
            } catch (error) {
                req.flash("danger", "Failed to send mail");
                return res.redirect("/auth/verify-email")
            }
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
 * Verify Email Route
 * Method POST
 */
exports.verifyOtp = asyncHandler(async (req, res) => {
    try {
        const otp = await Otp.findOne({ otp_code: req.body.otp, expiration_time: { $gt: Date.now() }, isused: false });
        if (!otp) {
            req.flash("danger", "Otp is invalid or expired");
            res.redirect("/auth/verify-otp");
        }

        await otp.updateOne({ expiration_time: null, isused: true });

        const user = await User.findByIdAndUpdate(otp.user_id, {
            isEmailVerified: true,
        });
        req.flash("success", "Email Vefifed successfully You can login now");
        res.redirect("/auth/login");
    } catch (error) {
        throw new Error(error);
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

/**
 * Send Otp page Route
 * Method GET
 */
exports.sendOtppage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        res.render("shop/pages/auth/send-otp", { title: "Send Otp", page: "Send Otp", messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Verify Otp page Route
 * Method GET
 */

exports.verifyOtppage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        res.render("shop/pages/auth/verify-otp", { title: "Send Otp", page: "Send Otp", messages });
    } catch (error) {
        throw new Error(error);
    }
});

