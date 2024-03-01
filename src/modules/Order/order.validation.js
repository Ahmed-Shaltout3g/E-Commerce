import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

const genral = {
  address: joi.string().min(4).max(255).required(),
  phoneNumber: joi
    .array()
    .items(
      joi
        .string()
        .regex(/^\+20[0-9]{10}$/)
        .messages({
          "string.pattern.base": "enter valid phone number",
        })
        .required()
    )
    .required(),
  paymentMethod: joi.string().valid("cash", "card").required(),
  couponCode: joi.string().min(3).max(55).optional(),
};
export const createOrderScheme = {
  body: joi
    .object({
      productId: generalFields._id,
      quantity: joi.number().integer().min(1).positive().required(),
      address: genral.address,
      phoneNumber: genral.phoneNumber,
      paymentMethod: genral.paymentMethod,
      couponCode: genral.couponCode,
    })
    .required(),
};

export const fromCartSchema = {
  body: joi
    .object({
      address: genral.address,
      phoneNumber: genral.phoneNumber,
      paymentMethod: genral.paymentMethod,
      couponCode: genral.couponCode,
    })
    .required(),
  query: joi
    .object({
      cartId: generalFields._id,
    })
    .required(),
};
