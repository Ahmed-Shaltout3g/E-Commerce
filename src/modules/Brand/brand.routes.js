import { Router } from "express";
import { myMulter } from "../../services/multer.js";
import allowedExtensions from "../../utils/allowedExtention.js";
import { asyncHandler } from "../../utils/errorHandling.js";
const router = Router();
import * as brandController from "./brand.controller.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import {
  addBrandSchema,
  brandSchema,
  deleteBrandSchema,
} from "./brand.validation.js";
import { Auth, authorization } from "../../middlewares/Auth.js";
import { systemRoles } from "../../utils/systemRoles.js";

router.post(
  "/create",

  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  myMulter(allowedExtensions.Image).single("image"),
  validationCoreFunction(addBrandSchema),
  asyncHandler(brandController.createBrand)
);

router.put(
  "/update",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  myMulter(allowedExtensions.Image).single("image"),
  validationCoreFunction(brandSchema),
  asyncHandler(brandController.updatebrand)
);

router.delete(
  "/delete",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  validationCoreFunction(deleteBrandSchema),
  asyncHandler(brandController.deleteBrand)
);
router.get("/", asyncHandler(brandController.getAllBrands));

export default router;
