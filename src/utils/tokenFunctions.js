import Jwt from "jsonwebtoken";
export const generateToken = ({
  payload = {},
  signature = process.env.TOKEN_KEY,
  expiresIn = "1 hour",
}) => {
  if (Object.keys(payload).length) {
    const token = Jwt.sign(payload, signature, { expiresIn });
    return token;
  }
  return false;
};

export const decodeToken = ({
  payload = "",
  signature = process.env.TOKEN_KEY,
}) => {
  if (payload.length) {
    const decode = Jwt.verify(payload, signature);
    return decode;
  }
  return false;
};
