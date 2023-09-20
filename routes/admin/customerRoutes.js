const express = require("express");
const router = express();

const customerController = require("../../controllers/admin/customerController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Customer Routes
router.get("/customers", customerController.customerpage);


module.exports=router;