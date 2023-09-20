const express = require("express");
const router = express();
const bannerController = require("../../controllers/admin/bannerController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Banner Routes
router.get("/banners", bannerController.bannerspage);
router.get("/add-banner", bannerController.addBannerpage);

module.exports=router;