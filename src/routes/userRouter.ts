import { Router } from "express";

import { verifyTokens } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { fileFilter } from "../lib/fileFilter";
import { verifyRole } from "../middlewares/role-middleware";
import {
  getUserController,
  getUsersController,
  updateUserProfileController,
} from "../controllers/userController";

import { asyncHandler } from "../utils/asyncHandler"; // 👈 import handler

const router = Router();

router.get("/", asyncHandler(getUsersController));
router.get("/:id", asyncHandler(getUserController));

router.patch(
  "/profile/update",
  verifyTokens,
  verifyRole(["CUSTOMER", "EVENT_ORGANIZER"]),
  uploader().fields([{ name: "profilePict", maxCount: 1 }]),
  fileFilter(["image/jpeg", "image/png", "image/avif"]),
  asyncHandler(updateUserProfileController) // 👈 wrap async controller
);

export default router;
