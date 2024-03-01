import { asyncHandler } from "../utils/errorHandling.js";
import { decodeToken } from "../utils/tokenFunctions.js";
import { userModel } from "./../../DB/Models/user.model.js";

const authFunction = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return next(
      new Error("In_valid token ,please login first", { cause: 400 })
    );
  }
  if (!token.startsWith("ecomm__")) {
    return next(new Error("Wrong Prefix", { cause: 401 }));
  }
  const separaedToken = token.split("ecomm__")[1];

  const decode = decodeToken({ payload: separaedToken });

  if (!decode?._id) {
    return next(new Error("fail decode", { cause: 500 }));
  }
  const user = await userModel
    .findById(decode._id)
    .select("email _id userName changePassAt role ");
  if (!user) {
    return next(new Error("please signUp first", { cause: 401 }));
  }

  if (decode.iat < user.changePassAt / 1000) {
    return next(
      new Error("token is expired, plese login first", { cause: 401 })
    );
  }

  req.user = user;
  next();
};

export const Auth = () => {
  return asyncHandler(authFunction);
};

export const authorization = (accessPoint) => {
  return (req, res, next) => {
    const { role } = req.user;
    if (!accessPoint.includes(role)) {
      return next(new Error("NO_Authorized", { cause: 403 }));
    }
    next();
  };
};
