import { nanoid } from "nanoid";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import slugify from "slugify";
import { categoryModel } from "../../../DB/Models/category.model.js";
import { brandModel } from "./../../../DB/Models/brand.model.js";
import { productModel } from "../../../DB/Models/product.model.js";

// =============================craete Subcategory======================
export const createSubCategory = async (req, res, next) => {
  // ===take category Id and check if it found or not ===
  const { categoryId } = req.query;
  const { name } = req.body;
  const { _id } = req.user;
  const category = await categoryModel.findById(categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }
  // === take name and check if dublicated
  const isNameDublicated = await subCategoryModel.findOne({ name });
  if (isNameDublicated) {
    return next(
      new Error("subCategory name is duplicated! please enter Another name", {
        cause: 404,
      })
    );
  }
  const slug = slugify(name, "_"); // slug the name
  if (!req.file) {
    return next(new Error("please upload your picture", { cause: 400 }));
  }
  const customId = nanoid(5); //random id
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${customId}`,
    }
  );
  req.ImagePath = `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${customId}`;
  const subCategoryObject = {
    name,
    slug,
    image: {
      secure_url,
      public_id,
    },
    customId,
    categoryId,
    createdBy: _id,
  };
  const createSubCtegory = await subCategoryModel.create(subCategoryObject);
  req.failedDocument = { model: subCategoryModel, _id: createSubCtegory._id };

  if (!createSubCtegory) {
    await cloudinary.uploader.destroy(public_id); //delete the image
    await cloudinary.api.delete_folder(
      `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${customId}`
    );
    return next(new Error("fail", { cause: 400 }));
  }
  res.status(201).json({
    message: "sub-category created successfuly",
    subCategory: createSubCtegory,
  });
  console.log(createSubCtegory);
};

// ===================== update subCategory ======================

export const updateSubCategory = async (req, res, next) => {
  const { subCategoryId } = req.query;
  const { _id } = req.user;
  const subCategory = await subCategoryModel.findById(subCategoryId);
  if (!subCategory) {
    return next(new Error("invalid subCategory id ", { cause: 404 }));
  }

  const category = await categoryModel.findById(subCategory.categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }
  // name equal old name
  const { name } = req.body;
  if (subCategory.name == name.toLowerCase) {
    return next(
      new Error("new name same old name please enter anothe name ", {
        cause: 404,
      })
    );
  }

  // name is not dublicated

  const isDublicated = await subCategoryModel.findOne({ name });
  if (isDublicated) {
    return next(
      new Error("new name is dublicated please enter anothe name ", {
        cause: 404,
      })
    );
  }

  // change  slug
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
    trim: true,
  });
  // add changes in DB
  subCategory.slug = slug;
  subCategory.name = name;

  // change image

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}`,
      }
    );

    // delete old image from host

    await cloudinary.uploader.destroy(subCategory.image.public_id);

    //  add change image  in DB
    subCategory.image = { secure_url, public_id };
  }

  // save changes in DB
  subCategory.updatedBy = _id;
  await subCategory.save();

  res.status(200).json({
    message: "subCategory update successfuly",
    subCategory,
  });
};

// ================== Delete subCategory ================
export const deleteSubCategory = async (req, res, next) => {
  const { subCategoryId } = req.query;
  const { _id } = req.user;
  const subCategory = await subCategoryModel.findOneAndDelete({
    _id: subCategoryId,
    createdBy: _id,
  });
  if (!subCategory) {
    return next(
      new Error("invalid subCategory id OR you are not created it ", {
        cause: 404,
      })
    );
  }

  const category = await categoryModel.findById(subCategory.categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }
  // delete form DB

  // delete brands related

  const brand = await brandModel.findOne({ subCategoryId });
  if (brand) {
    const deleteBrands = await brandModel.deleteMany({
      subCategoryId,
    });
    if (!deleteBrands.deletedCount) {
      return next(
        new Error("fail delete Brands please try again", { cause: 500 })
      );
    }
  }
  //  delete product link with this category
  const product = await productModel.findOne({ subCategoryId });
  if (product) {
    const deleteProducts = await productModel.deleteMany({
      subCategoryId,
    });

    if (!deleteProducts.deletedCount) {
      return next(
        new Error("fail delete Products please try again", { cause: 500 })
      );
    }
  }
  // delete form host

  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}`
  );
  await cloudinary.api.delete_folder(
    `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}`
  );
  res.status(200).json({
    message: "Done",
  });
};

// ========== get All Subcategory ================

export const getAllSubCategories = async (req, res, next) => {
  const Subcategories = await subCategoryModel
    .find() //get parent
    .populate({
      path: "categoryId",
      select: "name",
    }) //get children
    .populate({
      path: "Brand",
      select: "name",
      populate: {
        path: "products",
        select: "title priceAfterDiscount",
      },
    });
  if (Subcategories.length) {
    return res.status(200).json({
      message: "Done",
      Subcategories,
    });
  }
  res.status(200).json({
    message: "No Items",
  });
};
