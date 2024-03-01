import { Router } from "express";
const router = Router();
import * as cartController from "./cart.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { Auth } from "../../middlewares/Auth.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { addCartSchema, deleteCartSchema } from "./cart.validation.js";

router.post(
  "/add",
  Auth(),
  validationCoreFunction(addCartSchema),
  asyncHandler(cartController.addToCart)
);

router.delete(
  "/delete",
  Auth(),
  validationCoreFunction(deleteCartSchema),
  asyncHandler(cartController.deleteFromCart)
);
router.get("/", Auth(), asyncHandler(cartController.getAllProductInCarts));

export default router;
