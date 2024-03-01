import joi from "joi";
import { generalFields } from "./../../middlewares/validation.js";

export const addCouponSchema = {
  body: joi
    .object({
      couponCode: joi.string().min(3).max(55).required(),
      couponAmount: joi.number().positive().min(1).max(100).required(),
      isPrecentage: joi.boolean().optional(),
      isFixedAmount: joi.boolean().optional(),
      fromDate: joi
        .date()
        .greater(Date.now() - 24 * 60 * 60 * 1000)

        .message("must today or more")
        .required(),
      toDate: joi
        .date()
        .greater(joi.ref("fromDate"))

        .message("must After from date ")
        .required(),
      couponAssginedToUser: joi
        .array()
        .items(
          joi.object({
            userId: generalFields._id.required(),
            maxUsage: joi.number().integer().positive().required(),
          })
        )
        .required(),
    })
    .required(),
};

export const updateCouponSchema = {
  body: joi
    .object({
      couponCode: joi.string().min(3).max(55).optional(),
      couponAmount: joi.number().positive().min(1).max(100).optional(),
      fromDate: joi
        .date()
        .greater(Date.now() - 24 * 60 * 60 * 1000)

        .message("must today or more")
        .optional(),
      toDate: joi
        .date()
        .greater(joi.ref("fromDate"))

        .message("must After from date ")
        .optional(),
    })
    .required(),
};

export const couponDeleteSchema = {
  query: joi
    .object({
      couponId: generalFields._id,
    })
    .required(),
};

// Date format
// yyyy-MM-DD HH:MM
