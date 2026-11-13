import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { validateBody, validateParams } from "../middlewares/validate";
import { profileController } from "../controllers/profile.controller";
import {
  updateProfileSchema,
  changePasswordSchema,
  userIdParamSchema,
} from "../lib/validators/profile";

const router = Router();

router.use(requireAuth);

router.get("/me", profileController.getMyProfile);

router.get("/users/:id", validateParams(userIdParamSchema), profileController.getPublicProfile);

router.patch("/me", validateBody(updateProfileSchema), profileController.updateProfile);

router.patch("/me/password", validateBody(changePasswordSchema), profileController.changePassword);

router.delete("/me/account", profileController.deactivateAccount);

export default router;