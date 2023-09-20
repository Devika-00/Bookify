const { roles } = require("../utils/constants");

const ensureAdmin = (req, res, next) => {
    if (req?.user?.role === roles.admin || req?.user?.role === roles.superAdmin) {
        next();
    } else {
        req.flash("warning", "You are not Authorized");
        res.redirect("/");
    }
};



module.exports={ensureAdmin};