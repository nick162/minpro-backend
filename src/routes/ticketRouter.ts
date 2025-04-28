import { Router } from "express";

import { verifyTokens } from "../lib/jwt";
import { verifyRole } from "../middlewares/role-middleware";
import {
  createTicketController,
  getTicketController,
  getTicketsController,
  updateTicketController,
} from "../controllers/ticketController";
import { deleteTicketService } from "../services/ticket/deleteTickerService";

const router = Router();

router.get("/", getTicketsController);
router.get("/:slug", getTicketController);
router.delete("/:id", deleteTicketService);
router.post(
  "/",
  verifyTokens,
  verifyRole(["CUSTOMER"]),
  createTicketController
);

router.patch(
  "/:id",
  verifyTokens,
  verifyRole(["ORGANIZER"]),
  updateTicketController
);

export default router;
