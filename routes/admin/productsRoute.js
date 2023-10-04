const express = require("express");
const router = express();
const productController = require("../../controllers/admin/productController");
const { uploadMultiple, uplaodSingle,upload } = require('../../config/upload');



router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Product Routes
router.get("/products", productController.productspage);
router.get("/add-product", productController.addProductpage);
router.get("/edit-product/:id", productController.editProductpage);
router.get("/edit/image/:id", productController.editImagepage)

router.post("/add",uploadMultiple ,productController.createProduct);
router.put("/edit/:id", productController.updateProduct);
router.put("/list/:id", productController.listProduct);
router.put("/unlist/:id", productController.unlistProdcut);
router.put("/edit/image/:id", uplaodSingle, productController.editImage);
router.post("/edit-product/images/upload/new/:id", upload.array("files", 4), productController.addNewImages);

router.delete("/images/delete/:id", productController.deleteImage);
// router.put("/edit/images/upload/:id", upload.single("file"), productController.editProductImages);


module.exports=router;