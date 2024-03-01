import { Router } from "express";
import { asyncHandler } from "../../utils/errorHandling.js";
const router = Router();
import * as couponController from "./coupon.controller.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import {
  addCouponSchema,
  couponDeleteSchema,
  updateCouponSchema,
} from "./coupon.validation.js";
import { Auth, authorization } from "../../middlewares/Auth.js";
import { systemRoles } from "../../utils/systemRoles.js";

router.post(
  "/create",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  validationCoreFunction(addCouponSchema),
  asyncHandler(couponController.createCoupon)
);

router.put(
  "/update",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  validationCoreFunction(updateCouponSchema),
  asyncHandler(couponController.updateCoupon)
);

router.delete(
  "/delete",
  Auth(),
  authorization([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  validationCoreFunction(couponDeleteSchema),
  asyncHandler(couponController.deleteCoupon)
);
router.get("/", asyncHandler(couponController.getAllCoupon));

export default router;
