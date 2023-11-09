const asyncHandler = require("express-async-handler");
const User = require("../../models/usermodel");
const { validationResult } = require("express-validator");
const otpGenerator = require("../../utils/otpGenerator");
const emailSender = require("../../utils/emailSender");
const Otp = require("../../models/otpModel");
const generateOTP = require("../../utils/otpGenerator");
const sendEmail = require("../../utils/emailSender");
const validateMongoDbId = require("../../utils/validateMongoDbId");
const { Error } = require("mongoose");
const crypto = require("crypto");
const Wallet = require("../../models/walletModel");
const WalletTransaction  = require("../../models/walletTransactionModel");

/**Login route
 * GET Method
 */
exports.loginpage = asyncHandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("shop/pages/auth/login", {
      title: "Login",
      page: "login",
      messages,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/**Register route
 * GET Method
 */
exports.registerpage = asyncHandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("shop/pages/auth/register", {
      title: "Register",
      page: "register",
      data: "",
      messages,
    });
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
    const messages = req.flash();
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => {
        req.flash("danger", error.msg);
      });
      const messages = req.flash();
      res.render("shop/pages/auth/register", {
        title: "Register",
        page: "Login",
        messages,
        data: req.body,
      });
    } else {
      const email = req.body.email;
      const existingUser = await User.findOne({ email: email });

      if (!existingUser) {
        const newUser = await User.create(req.body);
        const wallet = await Wallet.create({ user: newUser._id });
        const otp = await Otp.create({
          user_id: newUser._id,
          user_email: newUser.email,
          otp_code: generateOTP(),
          expiration_time: Date.now() + 5 * 60 * 1000,
        });

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
                </html>`;

          sendEmail({
            email: newUser.email,
            subject: "Email Verification",
            html: html,
          });

          // req.flash("success", "Email send please check your inbox");
          return res.render("shop/pages/auth/verify-otp", {
            title: "Verify Email",
            page: "Verify Email",
            email: newUser.email,
            messages,
          });
        } catch (error) {
          req.flash("danger", "Failed to send mail");
          return res.render("shop/pages/auth/verify-otp", {
            title: "Verify Email",
            page: "Verify Email",
            email: newUser.email,
            messages,
          });
        }
      } else {
        req.flash("warning", "Email Alardy Registerd Please login");
        res.redirect("/auth/register");
      }
    }
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Verify Email Route
 * Method POST
 */
exports.verifyOtp = asyncHandler(async (req, res) => {
  try {
    const otp = await Otp.findOne({
      otp_code: req.body.otp,
      expiration_time: { $gt: Date.now() },
      isused: false,
    });
    if (!otp) {
      req.flash("danger", "Otp is invalid or expired");
      res.redirect("/auth/verify-otp");
    }

    await otp.updateOne({ expiration_time: null, isused: true });

    const user = await User.findByIdAndUpdate(otp.user_id, {
      isEmailVerified: true,
    });

    const referalCode = user.refferedBy;

    if(referalCode){
      const refferedUser = await User.findOne({refferalId:referalCode});
      const refferedUserWallet = await Wallet.findOneAndUpdate({user:refferedUser._id},{$inc:{balance:100}});

      const refferedUserWalletTransaction = await WalletTransaction.create({
        wallet:refferedUserWallet._id,
        amount:100,
        type:"credit",
      });

      const userwallet = await Wallet.findOneAndUpdate({user:user._id},{$inc:{balance:50}});

      const userWalletTransaction = await WalletTransaction.create({
        wallet:userwallet._id,
        amount:50,
        type:"credit",
      });

    }

    req.flash("success", "Email Vefifed successfully You can login now");
    res.redirect("/auth/login");
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Resend Email Route
 * Method POST
 */
exports.resendEmail = asyncHandler(async (req, res) => {
  const email = req.body.email;

  try {
    const messages = req.flash();
    const user = await User.findOne({ email: email });
    const otp = await Otp.create({
      user_id: user._id,
      user_email: user.email,
      otp_code: generateOTP(),
      expiration_time: Date.now() + 60000,
    });

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
                                    <p>Dear ${user.email},</p>
                                    <p>Thank you for registering with Craftopia! To complete the registration process and ensure the security of your account, please verify your email address.</p>
                                    <p>Here is your one-time verification code:</p>
                                    <p style="font-size: 24px; font-weight: bold;">OTP Code: ${otp.otp_code}</p>
                                    <p>Please use this code within the next 60 second to confirm your email address. If you do not verify your email within this time frame, you will need to request a new OTP.</p>
                                    <p>If you did not sign up for an account with Craftopia, please disregard this email.</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: center; padding: 30px;">
                                    <p>Thank you for choosing Craftopia. We look forward to serving you!</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;
    sendEmail({
      email: user.email,
      subject: "Email Verification",
      html: html,
    });
    // req.flash("success", "Email Send Please check your inbox");
    return res.render("shop/pages/auth/verify-otp", {
      title: "Verify Email",
      page: "Verify Email",
      email: user.email,
      messages,
    });
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
exports.forgotPasswordpage = asyncHandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("shop/pages/auth/forgot-password", {
      title: "Forgot-Password",
      page: "forgot-password",
      messages,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Forgot Password Page Route
 * Method GET
 */
exports.forgotPasswordpage = asyncHandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("shop/pages/auth/forgot-password", {
      title: "Forgot Password",
      page: "forgot-password",
      messages,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Forgot Password Route
 * Method POST
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      req.flash("danger", "Email Not Found");
      return res.redirect("/auth/forgot-password");
    }

    const resetToken = await user.createResetPasswordToken();
    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/auth/reset-password/${resetToken}`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
                    <tr>
                        <td align="center" bgcolor="#007bff" style="padding: 40px 0;">
                            <h1 style="color: #ffffff;">Password Reset</h1>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" style="padding: 40px 30px;">
                            <p>Dear ${user.firstName},</p>
                            <p>We have received a request to reset your password. To reset your password, click the button below:</p>
                            <p style="text-align: center;">
                                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                            </p>
                            <p>If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.</p>
                            <p>Thank you for using our service!</p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#f4f4f4" style="text-align: center; padding: 20px 0;">
                            <p>&copy; 2023 Craftopia</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

    try {
      sendEmail({
        email: user.email,
        subject: "Password Reset",
        html: html,
      });

      req.flash("success", "Reset Link sent to your mail id");
      return res.redirect("/auth/forgot-password");
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      console.error(error);
      req.flash(
        "danger",
        "There was an error sending the password reset email, please try again later"
      );
      return res.redirect("/auth/forgot-password");
    }
  } catch (error) {
    console.error(error);
    req.flash("danger", "An error occurred, please try again later");
    return res.redirect("/auth/forgot-password");
  }
});

/**
 * Reset Password Page Route
 * Method GET
 */
exports.resetPasswordpage = asyncHandler(async (req, res) => {
  try {
    const token = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("warning", "Token is invalid or has expired");
      res.redirect("/auth/forgot-password");
    }

    res.render("shop/pages/auth/reset-password", {
      title: "Reset Password",
      page: "Reset-password",
      token,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Reset Password Route
 * Method PUT
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      req.flash("warning", "Token is invalid or has expired");
      res.redirect("/auth/forgot-password");
    }

    user.password = req.body.password;
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    user.passwordChangedAt = Date.now();

    await user.save();

    req.flash("success", "Password changed");
    res.redirect("/auth/login");
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
    const email = req.body.email || req.user.email;
    const messages = req.flash();
    res.render("shop/pages/auth/verify-otp", {
      title: "Send Otp",
      page: "Send Otp",
      messages,
      email,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Blcoked User page
 * Method GET
 */
exports.blockedUserpage = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const user = await User.findById(id);
    res.render("shop/pages/auth/blocked", {
      title: "Blocked",
      page: "blocked",
      user,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * check email
 * post route
 */
exports.checkemail = asyncHandler(async (req, res) => {
  try {
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      res.json({ message: "email already registered" });
    } else {
      res.json({ message: "" });
    }
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * check mobile
 * post  route
 */
exports.checkmobile = asyncHandler(async(req,res)=>{
  try {

    
    const existingMobile = await User.findOne({mobile: req.body.mobile});
     
    if(existingMobile){
      res.json({status: true, message: "Mobile number alrady registered"})
    }else{
      res.json({status: false, message: ""});
    }
  } catch (error) {
    throw new Error(error)
  }
});
