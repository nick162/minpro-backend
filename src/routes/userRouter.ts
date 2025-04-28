import { Router } from "express";

import { verifyTokens } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { fileFilter } from "../lib/fileFilter";
import { verifyRole } from "../middlewares/role-middleware";
import { getUsersController } from "../controllers/userController";

const router = Router();

router.get("/", getUsersController);
// router.get("/:slug", getEventController);
// router.get("/:category", getEventsByCategoryController);
// router.get("/delete", getDeletedListProductsController);

// router.patch(
//   "/:id",
//   verifyTokens,
//   verifyRole(["ORGANIZER"]),
//   update
// )

export default router;
