const asyncHandler = require("express-async-handler");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const validateMongoDbId = require("../../utils/validateMongoDbId");
const path = require("path");
const sharp = require("sharp");
const Image = require("../../models/imageModal");

/**
 * Manage Product Page Route
 * Method GET
 */
exports.productspage = asyncHandler(async (req, res) => {
  try {
    const messages = req.flash();
    const products = await Product.find()
      .populate("category")
      .populate("images");
    res.render("admin/pages/products/product", {
      title: "Products",
      messages,
      products,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Add Product Page Route
 * Method GET
 */
exports.addProductpage = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({ isListed: true });
    res.render("admin/pages/products/add-product", {
      title: "Add Products",
      categories,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Edit Product Page Route
 * Method GET
 */
exports.editProductpage = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const categories = await Category.find({ isListed: true });
    const product = await Product.findById(id)
      .populate("category")
      .populate("images");
    res.render("admin/pages/products/edit-product", {
      title: "Edit Products",
      categories,
      product,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * add product route
 * method post
 */

exports.createProduct = async (req, res) => {
  try {
    const imageUrls = [];

    // Check if req.files exists and has images
    if (req.files && req.files.images.length > 0) {
      const images = req.files.images;

      for (const file of images) {
        try {
          const imageBuffer = await sharp(file.path)
            .resize(600, 800)
            .toBuffer();
          const thumbnailBuffer = await sharp(file.path)
            .resize(300, 300)
            .toBuffer();
          const imageUrl = path.join("/admin/uploads", file.filename);
          const thumbnailUrl = path.join("/admin/uploads", file.filename);
          imageUrls.push({ imageUrl, thumbnailUrl });
        } catch (error) {
          console.error("Error processing image:", error);
        }
      }

      const image = await Image.create(imageUrls);
      const ids = image.map((image) => image._id);

      const newProduct = await Product.create({
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        productPrice: req.body.productPrice,
        salePrice: req.body.salePrice,
        images: ids,
        quantity: req.body.quantity,
      });
      req.flash("success", "Product Created");
      res.redirect("/admin/product/products");
    } else {
      res.status(400).json({ error: "Invalid input: No images provided" });
    }
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Edit Product Route
 * Method PUT
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);
  try {
    const editedProduct = await Product.findByIdAndUpdate(id, req.body);
    req.flash("success", `Product ${editedProduct.title} updated`);
    res.redirect("/admin/product/products");
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * List Product Route
 * Method PUT
 */
exports.listProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, {
      isListed: true,
    });
    req.flash("success", `${updatedProduct.title} Listed`);
    res.redirect("/admin/product/products");
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Unlist Product Route
 * Method PUT
 */
exports.unlistProdcut = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, {
      isListed: false,
    });
    req.flash("warning", `${updatedProduct.title} Unllisted`);
    res.redirect("/admin/product/products");
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * edit-image
 * get method
 */
exports.editImagepage = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const messages = req.flash();
    const product = await Product.findById(id).populate("images").exec();
    res.render("admin/pages/products/update-image", {
      title: "Edit Images",
      product,
      messages,
    });
  } catch (error) {
    throw new Error(error);
  }
});

/**
 *
 * edit image
 * put method
 */

exports.editImage = asyncHandler(async (req, res) => {
  try {
    const imageId = req.params.id;
    const file = req.file;
    const imageBuffer = await sharp(file.path).resize(600, 800).toBuffer();
    const thumbnailBuffer = await sharp(file.path).resize(300, 300).toBuffer();
    const imageUrl = path.join("/admin/uploads", file.filename);
    const thumbnailUrl = path.join("/admin/uploads", file.filename);

    const images = await Image.findByIdAndUpdate(imageId, {
      imageUrl: imageUrl,
      thumbnailUrl: thumbnailUrl,
    });

    req.flash("success", "Image updated");
    res.redirect("back");
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Delete Product Image
 * Method DELETE
 */
exports.deleteImage = asyncHandler(async (req, res) => {
  try {
    const imageId = req.params.id;
    // Optionally, you can also remove the image from your database
    await Image.findByIdAndRemove(imageId);
    const product = await Product.findOneAndUpdate(
      { images: imageId },
      { $pull: { images: imageId } },
      { new: true }
    );
    res.json({ message: "Images Removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * Add New Images
 * Method POST
 */
exports.addNewImages = asyncHandler(async (req, res) => {
  try {
    const files = req.files;
    const imageUrls = [];
    const productId = req.params.id;

    for (const file of files) {
      try {
        const imageBuffer = sharp(file.path).resize(600, 600).toBuffer();
        const thumbnailBuffer = sharp(file.path).resize(300, 300).toBuffer();

        const imageUrl = path.join("/admin/uploads", file.filename);
        const thumbnailUrl = path.join("/admin/uploads", file.filename);
        imageUrls.push({imageUrl, thumbnailUrl})
      } catch (error) {
          console.log("Error Processing image: ", error);
      }
    }

    const image = await Image.create(imageUrls);
    const ids = image.map((image) => image._id);
    const product = await Product.findByIdAndUpdate(productId, {
      $push: { images: ids },
  });

  req.flash("success", "Image added");
        res.redirect("back");

  } catch (error) {
    throw new Error(error);
  }
});
