import { Router } from "express";
const router = Router();
import * as reviewController from "./review.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import allowedExtensions from "../../utils/allowedExtention.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { Auth, authorization } from "../../middlewares/Auth.js";
import { systemRoles } from "../../utils/systemRoles.js";
import { addReviewScheme } from "./review.validation.js";

router.post(
  "/create",
  Auth(),
  authorization([systemRoles.USER]),
  validationCoreFunction(addReviewScheme),
  asyncHandler(reviewController.addReview)
);

export default router;
