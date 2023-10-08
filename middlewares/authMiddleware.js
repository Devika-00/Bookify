const { roles } = require("../utils/constants");

const ensureAdmin = (req, res, next) => {
    if (req?.user?.role === roles.admin || req?.user?.role === roles.superAdmin) {
        next();
    } else {
        req.flash("warning", "You are not Authorized");
        res.redirect("back");
    }
};

const ensureUser = (req, res, next) => {
    if (req?.user?.role === roles.admin || req?.user?.role === roles.superAdmin) {
        res.redirect("/admin");
    } else {
        next();
    }
};

const isBlockedAdmin = (req, res, next) => {
    if (req.user.isBlocked) {
        res.redirect(`/admin/auth/blocked/${req.user._id}`);
    } else {
        next();
    }
};

const isBlockedUser = (req, res, next) => {
    if (req?.user?.isBlocked) {
        res.redirect(`/auth/blocked/${req.user._id}`);
    } else {
        next();
    }
};




module.exports={ensureAdmin, isBlockedAdmin,isBlockedUser,ensureUser};