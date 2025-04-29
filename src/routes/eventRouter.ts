import { Router } from "express";

import { verifyTokens } from "../lib/jwt";
import { uploader } from "../lib/multer";
import { fileFilter } from "../lib/fileFilter";
import { verifyRole } from "../middlewares/role-middleware";
import {
  createEventController,
  deleteEventController,
  getEventController,
  getEventsByCategoryController,
  getEventsController,
  updateEventController,
} from "../controllers/eventController";

const router = Router();

router.get("/", getEventsController);
router.get("/:slug", getEventController);
router.get("/:category", getEventsByCategoryController);
// router.get("/delete", getDeletedListProductsController);
router.post(
  "/",
  verifyTokens,
  verifyRole(["EVENT_ORGANIZER"]),
  uploader().fields([{ name: "thumbnail", maxCount: 1 }]),
  fileFilter(["image/jpeg", "image/png", "image/avif"]),
  createEventController
);
router.patch(
  "/:id",
  verifyTokens,
  verifyRole(["EVENT_ORGANIZER"]),
  uploader().fields([{ name: "thumbnail", maxCount: 1 }]),
  fileFilter(["image/jpeg", "image/png", "image/avif"]),
  updateEventController
);
router.delete(
  "/:id",
  verifyTokens,
  verifyRole(["ORGANIZER"]),
  deleteEventController
);

// router.patch(
//   "/:id",
//   verifyTokens,
//   verifyRole(["ORGANIZER"]),
//   update
// )

export default router;
