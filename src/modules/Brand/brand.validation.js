import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const addBrandSchema = {
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

export const brandSchema = {
  body: joi
    .object({
      name: joi.string().min(4).max(55).required(),
    })
    .required(),
  query: joi
    .object({
      brandId: generalFields._id,
    })
    .required(),
};

export const deleteBrandSchema = {
  query: joi
    .object({
      brandId: generalFields._id,
    })
    .required(),
};
