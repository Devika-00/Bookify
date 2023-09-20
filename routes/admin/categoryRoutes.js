const express = require("express");
const router = express();

const categoryController = require("../../controllers/admin/categoryController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Category Routes
router.get("/categories", categoryController.categoriespage);
router.get("/add-category", categoryController.addCategorypage);


module.exports=router;