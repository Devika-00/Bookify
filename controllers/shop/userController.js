const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongoDbId");
const User = require("../../models/usermodel");
const { validationResult } = require("express-validator");
const sharp = require("sharp");
const path = require('path');
const Address = require("../../models/addressamodel");
const { name } = require("ejs");
const Wallet = require("../../models/walletModel");
const WalletTransaction = require("../../models/walletTransactionModel");




/**
 * Profile Page Route
 * Method GET
 */
exports.profilepage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const user = await User.findById(req.user._id).populate("address");
        res.render("shop/pages/user/profile", { title: "Profile", page: "profile" ,user,messages});
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Profile page
 * Method PUT
 */
exports.editProfile = asyncHandler(async(req,res)=>{
    const id = req.params.id;
    validateMongoDbId(id);
    try{
        
        const{firstName,lastName,mobile,email} = req.body;
        const file = req.file;

        console.log(req.file);

        if(file){

        
        const avatharBuffer = await sharp(file.path)
            .resize(200, 200)
            .toBuffer();
          const avatharUrl = path.join("/admin/uploads", file.filename);

          const user = await User.findByIdAndUpdate(
            id,
            {
              firstName,
              lastName,
              image: avatharUrl,
              mobile,
              email,
            },);

            req.flash("success","profile updated");
            res.redirect("/user/profile");
        }
    }catch(error){
        throw new Error(error);
    }

});


/**
 * Address Page Route
 * Method GET
 */
exports.addresspage = asyncHandler(async (req, res) => {
    try {
        const userid = req.user._id;
        const userAddress = await User.findOne(userid).populate("address");
        const messages = req.flash()
        res.render("shop/pages/user/address", { title: "Address", page: "address", address:userAddress.address, messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Address Page Route
 * Method GET
 */
exports.addAddresspage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/addnewaddress", { title: "Add Address", page: "add-address" });
    } catch (error) {
        throw new Error(error);
    }
});


/**
 * add address route
 * method post
 */
exports.addAddress = asyncHandler(async(req,res)=>{
    try {
        
        const userid = req.user._id;
        
        const newAddress = await Address.create(req.body);
        await User.findByIdAndUpdate(userid, { $push: { address: newAddress._id } });
        req.flash("success", "Address Added");
        res.redirect("/user/address");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Address page Route
 * Method GET
 */
exports.editAddresspage = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDbId(id);
        const address = await Address.findById(id);
        res.render("shop/pages/user/edit-address", { title: "Edit Address", page: "Edit-address", address });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Delete Address Route
 * Method DELETE
 */
exports.deleteAddress = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user._id;
        validateMongoDbId(id);
        await User.findByIdAndUpdate(userId, { $pull: { address: id } });
        const address = await Address.findByIdAndDelete(id);
        req.flash("warning", "address deleted");
        res.redirect("/user/address");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Address Route
 * Method POST
 */
exports.editAddress = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDbId(id);
        const address = await Address.findByIdAndUpdate(id, req.body);
        req.flash("success", "address updated");
        res.redirect("/user/address");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * wallet page
 * method get
 */
exports.walletpage = asyncHandler(async(req, res)=>{
    try {
        const messages = req.flash();
        const user = req.user._id;
        const wallet = await Wallet.findOne({ user: user._id });
        res.render("shop/pages/user/wallet",{title:"wallet",page:"wallet",wallet,user,messages});
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * wallet transaction page
 * get method
 */
exports.walletTransactionspage = asyncHandler(async(req,res)=>{
    try {
        const walletId = req.params.id;
        const walletTransaction = await WalletTransaction.find({wallet:walletId});
        console.log(walletTransaction);
        res.render("shop/pages/user/walletTransaction",{title:"wallettransaction",page:"wallettransaction", walletTransaction,});
    } catch (error) {
       throw new Error(error); 
    }
})