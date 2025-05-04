import { Router } from "express";

import { verifyTokens } from "../lib/jwt";
import { verifyRole } from "../middlewares/role-middleware";
import {
  createTicketController,
  deleteticketController,
  getTicketByIdController,
  getTicketsController,
  updateTicketController,
} from "../controllers/ticketController";

const router = Router();

router.delete("/:id", deleteticketController);
router.get("/", getTicketsController);
router.get("/:id", getTicketByIdController);

router.post(
  "/",
  verifyTokens,
  verifyRole(["CUSTOMER"]),
  createTicketController
);

router.patch(
  "/:id",
  verifyTokens,
  verifyRole(["EVENT_ORGANIZER"]),
  updateTicketController
);

export default router;
