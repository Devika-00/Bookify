const express = require("express");
const router = express();

const adminController = require("../../controllers/admin/adminController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

//Admin route
router.get("/", adminController.homepage);
router.get("/dashboard", adminController.dashboardpage);
router.get("/settings", adminController.settingspage);
router.get("/sales-report", adminController.salesReportpage);
router.get("/sales-data", adminController.getSalesData);
router.get("/sales-data/yearly", adminController.getSalesDataYearly);
// router.get("/sales-data/weekly", adminController.getSalesDataWeekly);

router.get("/get/sales-report", adminController.generateSalesReport);
router.get("*", (req, res) => {
    res.render("admin/pages/404", { title: "404 Page" });
});


module.exports=router;
