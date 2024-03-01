import { generalFields } from "../../middlewares/validation.js";
import joi from "joi";

export const addCartSchema = {
  body: joi
    .object({
      productId: generalFields._id,
      quantity: joi.number().integer().min(1).positive().required(),
    })
    .required(),
};

export const deleteCartSchema = {
  body: joi
    .object({
      productId: generalFields._id,
    })
    .required(),
};
