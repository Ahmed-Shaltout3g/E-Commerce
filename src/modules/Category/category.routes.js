import { Router } from "express";
const router = Router();
import * as CategoryController from "./category.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { myMulter } from "../../services/multer.js";
import allowedExtensions from "../../utils/allowedExtention.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import {
  categoryDeleteSchema,
  categorySchema,
  categoryUpdateSchema,
} from "./category.validation.js";
import { Auth, authorization } from "../../middlewares/Auth.js";
import { systemRoles } from "../../utils/systemRoles.js";

router.post(
  "/create",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  myMulter().single("image"),
  validationCoreFunction(categorySchema),
  asyncHandler(CategoryController.createCategory)
);

router.put(
  "/update",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  myMulter(allowedExtensions.Image).single("image"),
  validationCoreFunction(categoryUpdateSchema),
  asyncHandler(CategoryController.updateCategory)
);
router.delete(
  "/delete",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  validationCoreFunction(categoryDeleteSchema),
  asyncHandler(CategoryController.deleteCategory)
);
router.get("/", asyncHandler(CategoryController.getAllCategory));

export default router;
