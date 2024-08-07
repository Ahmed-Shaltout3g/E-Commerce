import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const addReviewScheme = {
  body: joi
    .object({
      reviewRate: joi.number().min(1).max(5).required(),
      reviewComment: joi.string().min(4).max(255).optional(),
    })
    .required(),
  query: joi
    .object({
      productId: generalFields._id.required(),
    })
    .required(),
};
