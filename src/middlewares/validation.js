import joi from "joi";
import { Types } from "mongoose";

const reqMethods = ["body", "query", "params", "headers", "file", "files"];
// ==================object id  validation=========
const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value) ? true : helper.message("in_valid id ");
};
export const generalFields = {
  email: joi
    .string()
    .email({ tlds: { allow: ["com", "net", "org"] } })
    .required(),
  password: joi
    .string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .messages({
      "string.pattern.base": "Password regex fail",
    })
    .required(),
  _id: joi.string().custom(validateObjectId),
};

export const validationCoreFunction = (schema) => {
  return (req, res, next) => {
    const validationErrorArr = [];
    for (const key of reqMethods) {
      if (schema[key]) {
        const validationResult = schema[key].validate(req[key], {
          abortEarly: false,
        }); // error
        if (validationResult.error) {
          validationErrorArr.push(validationResult.error.details);
        }
      }
    }

    if (validationErrorArr.length) {
      req.validationErrorArr = validationErrorArr;
      return next(new Error(" ", { cause: 400 }));
    }
    next();
  };
};
