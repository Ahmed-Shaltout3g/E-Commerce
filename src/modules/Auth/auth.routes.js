import { Router } from "express";
import * as allRoutes from "./auth.controller.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as validations from "./auth.validation.js";
import { validationCoreFunction } from "../../middlewares/validation.js";

const router = Router();
router.post(
  "/signup",
  validationCoreFunction(validations.signUpVaildation),
  asyncHandler(allRoutes.signUp)
);
router.post(
  "/signin",
  validationCoreFunction(validations.signInVaildation),
  asyncHandler(allRoutes.login)
);
router.get(
  "/confirmEmail/:token",
  validationCoreFunction(validations.confirmationEmailValidation),
  asyncHandler(allRoutes.confirmEmail)
);

router.post(
  "/forget",
  validationCoreFunction(validations.forgetPassVaildation),
  asyncHandler(allRoutes.forgetPass)
);

router.post("/resetPass/:token",validationCoreFunction(validations.resetPassVaildation), asyncHandler(allRoutes.resetPassword));

export default router;
