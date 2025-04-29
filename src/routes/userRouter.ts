import { Router } from "express";

import { verifyTokens } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { fileFilter } from "../lib/fileFilter";
import { verifyRole } from "../middlewares/role-middleware";
import {
  getUserController,
  getUsersController,
} from "../controllers/userController";

const router = Router();

router.get("/", getUsersController);
router.get("/:id", getUserController);
// router.get("/:category", getEventsByCategoryController);
// router.get("/delete", getDeletedListProductsController);

// router.patch(
//   "/:id",
//   verifyTokens,
//   verifyRole(["ORGANIZER"]),
//   update
// )

export default router;
