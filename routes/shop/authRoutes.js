const express = require ('express');
const router = express.Router();
const passport = require("passport");
const {body} = require("express-validator");

const {ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");


const authController = require("../../controllers/shop/authController");

router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

//Auth route
router.get("/login", ensureLoggedOut({ redirectTo: "/" }), authController.loginpage);
router.get("/register",ensureLoggedOut({ redirectTo: "/" }), authController.registerpage);
router.get("/forgot-password",ensureLoggedOut({ redirectTo: "/" }), authController.forgotPasswordpage);
router.get("/forgot-password-success",ensureLoggedOut({ redirectTo: "/" }), authController.forgotPasswordSuccesspage);
router.get("/logout", ensureLoggedIn({redirectTo:"/auth/login"}), authController.logoutUser);
// router.get("/send-otp", authController.sendOtppage);
router.get("/verify-otp", authController.verifyOtppage);

router.post("/verify-otp", authController.verifyOtp);
router.post("/login",passport.authenticate("local", { successRedirect: "/", failureRedirect: "/auth/login", failureFlash: true }));

router.post("/register",
[
    body("email").trim().isEmail().withMessage("Email must be valid email").normalizeEmail().toLowerCase(),
    body("mobile").trim().isMobilePhone().withMessage("Enter a valid mobile number"),
    body("password").trim().isLength(2).withMessage("Password length short, min 2 characters required"),
    body("confirm-password").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password do not match");
        }
        return true;
    }),
],
    authController.registerUser);



module.exports= router;    