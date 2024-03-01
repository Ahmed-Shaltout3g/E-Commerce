import slugify from "slugify";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinaryConfigration.js";
import { categoryModel } from "../../../DB/Models/category.model.js";
import { brandModel } from "../../../DB/Models/brand.model.js";
import { productModel } from "../../../DB/Models/product.model.js";

// ========================create brand==================

export const createBrand = async (req, res, next) => {
  const { _id } = req.user;
  const { subCategoryId } = req.query;
  const { name } = req.body;
  const subCategory = await subCategoryModel.findById(subCategoryId);
  if (!subCategory) {
    return next(new Error("invalid subCategory id ", { cause: 404 }));
  }
  console.log(subCategory);

  const category = await categoryModel.findById(subCategory.categoryId);
  if (!category) {
    return next(new Error("invalid Category id ", { cause: 404 }));
  }

  const slug = slugify(name, {
    replacement: "_",
    lower: true,
    trim: true,
  });
  if (!req.file) {
    return next(new Error("please upload brand logo", { cause: 400 }));
  }
  const customId = nanoid(5);

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${customId}`,
    }
  );

  req.ImagePath = `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${customId}`;

  const brandObject = {
    name,
    slug,
    customId,
    categoryId: subCategory.categoryId,
    subCategoryId,
    logo: { secure_url, public_id },
    createdBy: _id,
  };

  const brand = await brandModel.create(brandObject);
  req.failedDocument = { model: brandModel, _id: brand._id };

  if (!brand) {
    await cloudinary.uploader.destroy(public_id);
    await cloudinary.api.delete_folder(
      `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${customId}`
    );

    return next(new Error("fail", { cause: 400 }));
  }
  res.status(201).json({
    message: "brand created successfuly",
    brand,
  });
};

//  ======================update brand==============

export const updatebrand = async (req, res, next) => {
  const { brandId } = req.query;
  const { _id } = req.user;
  const brand = await brandModel.findById(brandId);
  if (!brand) {
    return next(new Error("invalid brand id ", { cause: 404 }));
  }

  const subcategory = await subCategoryModel.findById(brand.subCategoryId);
  if (!subcategory) {
    return next(new Error("invalid subcategory id ", { cause: 404 }));
  }
  const category = await categoryModel.findById(subcategory.categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }
  // name equal old name
  const { name } = req.body;
  if (name) {
    if (brand.name == name.toLowerCase()) {
      return next(
        new Error("new name same old name please enter anothe name ", {
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
    brand.slug = slug;
    brand.name = name;
  }
  // change image

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subcategory.customId}/Brands/${brand.customId}`,
      }
    );

    // delete old image from host

    await cloudinary.uploader.destroy(brand.logo.public_id);

    //  add change image  in DB
    brand.logo = { secure_url, public_id };
  }

  // save changes in DB
  brand.updatedBy = _id;
  await brand.save();

  res.status(200).json({
    message: "subCategory update successfuly",
    brand,
  });
};

// =================delete brand =================

export const deleteBrand = async (req, res, next) => {
  const { brandId } = req.query;
  const { _id } = req.user;
  const brand = await brandModel.findOneAndDelete({
    _id: brandId,
    createdBy: _id,
  });
  if (!brand.deletedCount) {
    return next(
      new Error(
        "invalid brand id or you can't delete this because you are not created it ",
        { cause: 404 }
      )
    );
  }
  const subcategory = await subCategoryModel.findById(brand.subCategoryId);
  if (!subcategory) {
    return next(new Error("invalid subcategory id ", { cause: 404 }));
  }
  const category = await categoryModel.findById(brand.categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }

  //  delete product related brand

  const product = await productModel.findOne({ brandId });
  if (product) {
    const deleteProducts = await productModel.deleteMany({
      brandId,
    });

    if (!deleteProducts.deletedCount) {
      return next(
        new Error("fail delete Products please try again", { cause: 500 })
      );
    }
  }

  // delete form host
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subcategory.customId}/Brands/${brand.customId}`
  );
  await cloudinary.api.delete_folder(
    `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subcategory.customId}/Brands/${brand.customId}`
  );
  res.status(200).json({
    message: "Brand delete successfuly",
  });
};

//================== get all brands===================

export const getAllBrands = async (req, res, next) => {
  const brands = await brandModel
    .find()
    .populate({
      path: "categoryId",
      select: "name",
    })
    .populate({
      path: "subCategoryId",
      select: "name",
    })
    .populate({
      path: "products",
    });
  if (brands.length) {
    return res.status(200).json({
      message: "Done",
      brands,
    });
  }
  res.status(200).json({
    message: "No Items",
  });
};
