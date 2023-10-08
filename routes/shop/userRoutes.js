const express = require ('express');
const router = express.Router();
const {upload} =require("../../config/upload");

const userControler=require("../../controllers/shop/userController");

router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

//User routes
router.get("/profile", userControler.profilepage);
router.get("/address", userControler.addresspage);
router.get("/checkout", userControler.checkoutpage);
router.get("/add-address", userControler.addAddresspage);
router.get("/address/edit/:id", userControler.editAddresspage);
router.get("/wallet", userControler.walletpage);

router.post("/add-address", userControler.addAddress);

router.put("/profile/edit/:id", upload.single("file"), userControler.editProfile);
router.put("/address/edit/:id", userControler.editAddress);

router.delete("/address/delete/:id", userControler.deleteAddress);

module.exports= router;