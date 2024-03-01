import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const addProductScheme = {
  body: joi
    .object({
      title: joi.string().min(4).max(55).required(),
      desc: joi.string().min(4).max(255).optional(),
      colors: joi.array().items(joi.string().required()).required(),
      size: joi.array().items(joi.string().required()).optional(),
      price: joi.number().positive().required(),
      discount: joi.number().min(0).max(100).positive().optional(),
      stock: joi.number().positive().required(),
    })
    .required(),
  query: joi
    .object({
      categoryId: generalFields._id,
      subCategoryId: generalFields._id,
      brandId: generalFields._id,
    })
    .required()
    .options({ presence: "required" }),
};
