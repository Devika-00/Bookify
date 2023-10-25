const asyncHandler = require("express-async-handler");
const Category = require("../../models/categoryModel");
const validateMongoDbId = require("../../utils/validateMongoDbId");

/**
 * Manage Category Page Route
 * Method GET
 */
exports.categoriespage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const categories = await Category.find();
        res.render("admin/pages/category/categories", { title: "Category",categories,messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Product Page Route
 * Method GET
 */
exports.addCategorypage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        res.render("admin/pages/category/add-category", { title: "Add Category",messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Category Page Route
 * Method GET
 */
exports.editCategorypage = asyncHandler(async(req,res)=>{
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const messages = req.flash();
        const category = await Category.findById(id);
        res.render("admin/pages/category/edit-category", { title:"edit category",category,messages});
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Category
 * Method POST
 */
exports.addCategory = asyncHandler(async (req, res) => {
    try {
        const existingCategory = await Category.findOne({title:{$regex: new RegExp(req.body.title, "i")}});
        if(existingCategory){
            req.flash("warning","Category already exist");
            res.redirect("/admin/category/add-category");
        }else {
            const newCategory = await Category.create(req.body);
        req.flash("success", `${newCategory.title} added`);
        res.redirect("/admin/category/categories");
        }

        
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Unlist Category
 * Method PUT
 */
exports.unlist = asyncHandler(async(req,res)=>{
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const UnlistedCategory = await Category.findByIdAndUpdate(
            id,
            {
                isListed:false,
            }
        );
        if(UnlistedCategory){
            req.flash("success",`${UnlistedCategory.title} is unlisted`);
            res.redirect("/admin/category/categories");
        }else{
            req.flash("danger", `Can't Unlist ${unlistedCategory.title}`);
        }
    } catch ( error) {
      throw new Error(error);  
    }
});

/**
 * List Category
 * Method PUT
 */
exports.list = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const listedCategory = await Category.findByIdAndUpdate(
            id,
            {
                isListed: true,
            },
        );
        if (listedCategory) {
            req.flash("success", `${listedCategory.title} is listed`);
            res.redirect("/admin/category/categories");
        } else {
            req.flash("danger", `Can't List ${listedCategory.title}`);
        }
    } catch (error) {
        throw new Error(error);
    }
});


/**
 * Edit Category
 * Method PUT
 */
exports.editCategory = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const {title, isListed, offer, offerDescription, startDate, endDate} = req.body;

        const editedCategory = await Category.findById(id);
        editedCategory.title = title;
        editedCategory.isListed = isListed;
        editedCategory.offer = offer;
        editedCategory.offerDescription = offerDescription;
        editedCategory.startDate = startDate;
        editedCategory.endDate = endDate;
        editedCategory.save();
        req.flash("success", `Category ${editedCategory.title} updated`);
        res.redirect("/admin/category/categories");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Delete Category
 * Method DELETE
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        req.flash("success", `Category ${deletedCategory.title} deleted`);
        res.redirect("/admin/category/categories");
    } catch (error) {
        throw new Error(error);
    }
});
