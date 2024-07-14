import { Router } from "express";
const router = Router();
import * as orderController from "./order.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";

import { Auth, authorization } from "../../middlewares/Auth.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { createOrderScheme, fromCartSchema } from "./order.validation.js";
import { systemRoles } from "../../utils/systemRoles.js";

router.post(
  "/create",
  Auth(),
  validationCoreFunction(createOrderScheme),
  asyncHandler(orderController.createOrder)
);
router.post(
  "/orderCart",
  Auth(),
  validationCoreFunction(fromCartSchema),
  asyncHandler(orderController.fromCartToOrde)
);
router.post(
  "/orderCart",
  Auth(),
  validationCoreFunction(fromCartSchema),
  asyncHandler(orderController.fromCartToOrde)
);
router.post(
  "/delivere",
  Auth(),
  authorization([systemRoles.DELIVERD_ORDER]),
  asyncHandler(orderController.deliverOrder)
);
router.put("/cancel", Auth(), asyncHandler(orderController.cancelOrder));
router.patch("/successPayment", asyncHandler(orderController.successPayment));
router.patch("/cancelPayment", asyncHandler(orderController.cancelPayment));

// router.get("/", Auth(), asyncHandler(orderController.getAllProductInorders));

export default router;
