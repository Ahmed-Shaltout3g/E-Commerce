import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const signUpVaildation = {
  body: joi
    .object()
    .required()
    .keys({
      userName: joi.string().min(3).max(1000).required(),
      email: generalFields.email,
      password: generalFields.password,
      repassword: joi.string().valid(joi.ref("password")).required(),
      gender: joi.string().optional(),
      age: joi.number().min(2).optional(),
      phone: joi
        .string()
        .regex(/^\+20[0-9]{10}$/)
        .messages({
          "string.pattern.base": "enter valid phone number",
        })
        .required(),
      address: joi.array().items(joi.string()),
    }),
};

export const confirmationEmailValidation = () => {
  params: joi.object().required().keys({
    token: joi.string().required(),
  });
};

export const signInVaildation = {
  body: joi.object().required().keys({
    email: generalFields.email,
    password: generalFields.password,
  }),
};

export const forgetPassVaildation = {
  body: joi.object().required().keys({
    email: generalFields.email,
  }),
};

export const resetPassVaildation = {
  body: joi.object().required().keys({
    newPassword: generalFields.password,
  }),
};
