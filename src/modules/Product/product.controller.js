import slugify from "slugify";
import { categoryModel } from "../../../DB/Models/category.model.js";
import { subCategoryModel } from "./../../../DB/Models/subCategory.model.js";
import { brandModel } from "./../../../DB/Models/brand.model.js";
import { nanoid } from "nanoid";
import cloudinary from "./../../utils/cloudinaryConfigration.js";
import { productModel } from "./../../../DB/Models/product.model.js";
import { pagination } from "../../utils/pagination.js";
import { ApiFeature } from "../../utils/apiFeature.js";

// // =================create product=================

export const createProduct = async (req, res, next) => {
  const { title, desc, price, colors, size, discount, stock } = req.body;
  const { categoryId, subCategoryId, brandId } = req.query;
  const { _id } = req.user;
  const category = await categoryModel.findById(categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }
  const subCategory = await subCategoryModel.findById(subCategoryId);
  if (!subCategory) {
    return next(new Error("invalid subCategory id ", { cause: 404 }));
  }
  const brand = await brandModel.findById(brandId);
  if (!brand) {
    return next(new Error("invalid brand id ", { cause: 404 }));
  }
  const slug = slugify(title, {
    replacement: "_",
    lower: true,
    trim: true,
  });

  const priceAfterDiscount = price * (1 - (discount || 0) / 100);

  if (!req.files.length) {
    return next(new Error("please upload product images", { cause: 400 }));
  }

  const customId = nanoid(5); //random id

  let imagesArr = [];

  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${brand.customId}/Products/${customId}`,
      }
    );
    imagesArr.push({ secure_url, public_id });
  }
  //   validation in error handling
  req.ImagePath = `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${brand.customId}/Products/${customId}`;

  const productObject = {
    title,
    desc,
    slug,
    size,
    customId,
    stock,
    colors,
    price,
    discount,
    priceAfterDiscount,
    Images: imagesArr,
    categoryId,
    subCategoryId,
    brandId,
    createdBy: _id,
  };

  const createProduct = await productModel.create(productObject);
  req.failedDocument = { model: productModel, _id: createProduct._id };

  if (!createProduct) {
    await cloudinary.api.delete_resources_by_prefix(
      `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${brand.customId}/Products/${customId}` ///delete folder  'api.delete'
    ); //delete the image
    await cloudinary.api.delete_folder(
      `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${brand.customId}/Products/${customId}` ///delete folder  'api.delete'
    );
    return next(new Error("fail", { cause: 400 }));
  }
  res.status(201).json({
    message: " created successfuly",
    products: createProduct,
  });
};

// // ============================update product ====================

export const updateproduct = async (req, res, next) => {
  const { title, desc, price, colors, size, discount, stock } = req.body;
  const { productId, categoryId, brandId, subCategoryId } = req.query;
  const { _id } = req.user;
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new Error("invalid product id ", { cause: 404 }));
  }

  const category = await categoryModel.findById(
    categoryId || product.categoryId
  );
  if (categoryId) {
    if (!category) {
      return next(new Error("invalid category id ", { cause: 404 }));
    }
    product.categoryId = categoryId;
  }
  const subCategory = await categoryModel.findById(
    categoryId || product.subCategory
  );

  if (subCategoryId) {
    if (!subCategory) {
      return next(new Error("invalid subCategory id ", { cause: 404 }));
    }
    product.subCategoryId = subCategoryId;
  }
  const brand = await brandModel.findById(brandId || product.brandId);
  if (brandId) {
    if (!brand) {
      return next(new Error("invalid Brand id ", { cause: 404 }));
    }
    product.brandId = brandId;
  }

  if (title) {
    const slug = slugify(title, {
      replacement: "_",
      lower: true,
      trim: true,
    });
    product.title = title;
    product.slug = slug;
  }

  // ================  change price ==================

  if (discount && price) {
    const priceAfterDiscount = price * (1 - (discount || 0) / 100);
    product.price = price;
    product.priceAfterDiscount = priceAfterDiscount;
    product.discount = discount;
  } else if (price) {
    const priceAfterDiscount = price * (1 - (product.discount || 0) / 100);
    product.price = price;
    product.priceAfterDiscount = priceAfterDiscount;
  } else if (discount) {
    const priceAfterDiscount = product.price * (1 - (discount || 0) / 100);

    product.priceAfterDiscount = priceAfterDiscount;
    product.discount = discount;
  }

  //   =============change image==============

  if (req.files?.length) {
    //if need to change image for category
    // add new image
    let imagesArr = [];
    // let publicIdsArr = [];
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${brand.customId}/Products/${product.customId}`,
        }
      );
      imagesArr.push({ secure_url, public_id });
      // publicIdsArr.push(public_id);
    }

    // delete images in host
    let publicIdsArr = [];
    for (const image of product.Images) {
      publicIdsArr.push(image.public_id);
    }
    await cloudinary.api.delete_resources(publicIdsArr);

    product.Images = imagesArr;
  }

  if (desc) product.desc = desc;
  if (size) product.size = size;
  if (colors) product.colors = colors;
  if (stock) product.stock = stock;
  product.updatedBy = _id;

  // save all changes
  await product.save();

  res.status(200).json({
    message: "Done",
    product,
  });
};

// // ======================delete product ==================

export const deleteProduct = async (req, res, next) => {
  const { productId } = req.query;
  const { _id } = req.user;
  const product = await productModel.findOneAndDelete({
    _id: productId,
    createdBy: _id,
  });
  if (!product) {
    return next(new Error("invalid Product id ", { cause: 404 }));
  }

  const category = await categoryModel.findById(product.categoryId);
  if (!category) {
    return next(new Error("invalid category id ", { cause: 404 }));
  }
  const subCategory = await subCategoryModel.findById(product.subCategoryId);
  if (!subCategory) {
    return next(new Error("invalid subCategory id ", { cause: 404 }));
  }
  const brand = await brandModel.findById(product.brandId);
  if (!brand) {
    return next(new Error("invalid brand id ", { cause: 404 }));
  }

  // ===delete from host ===
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${brand.customId}/Products/${product.customId}` ///delete images  'api.delete'
  );
  await cloudinary.api.delete_folder(
    `${process.env.ECOMMERCE_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${brand.customId}/Products/${product.customId}` ///delete folder  'api.delete'
  );

  res.status(200).json({
    message: "Done",
  });
};

// ===================get All product==============

// export const getAllProducts = async (req, res, next) => {
//   const { page, size } = req.query;

//   const { perPages, skip, currentPage, nextPage, prePage } = pagination({
//     page,
//     size,
//   });
//   const all = await productModel.find().count();
//   const products = await productModel.find().limit(perPages).skip(skip);
//   const totalPages = Math.ceil(all / perPages);

//   if (products.length) {
//     return res.status(200).json({
//       message: "Done",
//       data: products,
//       perPages,
//       currentPage,
//       nextPage,
//       prePage,
//       totalPages,
//     });
//   }
//   res.status(200).json({
//     message: "No Items yet",
//   });
// };

export const getAllProducts = async (req, res, next) => {
  const apiFeaturesInistant = new ApiFeature(productModel.find(), req.query)
    .paginated()
    .sort()
    .select()
    .filters()
    .search();

  const products = await apiFeaturesInistant.mongooseQuery;
  const paginationInfo = await apiFeaturesInistant.paginationInfo;
  const all = await productModel.find().count();
  const totalPages = Math.ceil(all / paginationInfo.perPages);
  paginationInfo.totalPages = totalPages;
  if (products.length) {
    return res.status(200).json({
      message: "Done",
      data: products,
      paginationInfo,
    });
  }
  res.status(200).json({
    message: "No Items yet",
  });
};
