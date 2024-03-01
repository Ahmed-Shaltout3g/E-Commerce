import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const subCategorySchema = {
  body: joi
    .object({
      name: joi.string().min(4).max(55).required(),
    })
    .required(),
  query: joi
    .object({
      categoryId: generalFields._id,
    })
    .required(),
};

export const subCategoryUpdateSchema = {
  body: joi
    .object({
      name: joi.string().min(4).max(55).required(),
    })
    .required(),
  query: joi
    .object({
      subCategoryId: generalFields._id,
    })
    .required(),
};

export const subCategoryDeleteSchema = {
  query: joi
    .object({
      subCategoryId: generalFields._id,
    })
    .required(),
};
