import { Router } from "express";
import { verifyTokens } from "../lib/jwt";
import { verifyRole } from "../middlewares/role-middleware";
import {
  acceptTransactionController,
  getTransactionsController,
  getWaitingTransactionController,
  rejectTransactionController,
} from "../controllers/transactionController";

const router = Router();

router.get(
  "/",
  verifyTokens,
  verifyRole(["EVENT_ORGANIZER"]),
  getTransactionsController
);
router.patch(
  "/accept/:id",
  verifyTokens,
  verifyRole(["EVENT_ORGANIZER"]),
  acceptTransactionController
);
router.patch(
  "/reject/:id",
  verifyTokens,
  verifyRole(["EVENT_ORGANIZER"]),
  rejectTransactionController
);

router.get(
  "/waiting",
  verifyTokens,
  verifyRole(["EVENT_ORGANIZER"]),
  getWaitingTransactionController
);

export default router;
