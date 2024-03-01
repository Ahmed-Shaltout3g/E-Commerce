import { Router } from "express";
const router = Router();
import * as poductController from "./product.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { myMulter } from "../../services/multer.js";
import allowedExtensions from "../../utils/allowedExtention.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { addProductScheme } from "./product.validation.js";
import { Auth, authorization } from "../../middlewares/Auth.js";
import { systemRoles } from "../../utils/systemRoles.js";

router.post(
  "/create",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  myMulter(allowedExtensions.Image).array("image", 3),
  validationCoreFunction(addProductScheme),
  asyncHandler(poductController.createProduct)
);
router.put(
  "/update",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  myMulter(allowedExtensions.Image).array("image", 3),
  asyncHandler(poductController.updateproduct)
);
router.delete(
  "/delete",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),

  asyncHandler(poductController.deleteProduct)
);
router.get(
  "/",

  asyncHandler(poductController.getAllProducts)
);

export default router;
