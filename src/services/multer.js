import multer from "multer";
import allowedExtensions from "../utils/allowedExtention.js";

export const myMulter = ({
  customValidation = allowedExtensions.Image,
} = {}) => {
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, cb) => {
    console.log(file);
    if (!customValidation.includes(file.mimetype)) {
      return cb(new Error("In-valid extintions ", { cause: 409 }, false));
    }
    cb(null, true);
  };
  const upload = multer({ fileFilter, storage });
  return upload;
};
