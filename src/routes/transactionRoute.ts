import { Router } from "express";
import { verifyTokens } from "../lib/jwt";
import { verifyRole } from "../middlewares/role-middleware";
import {
  acceptTransactionController,
  createTransactionController,
  getAttendeeListController,
  getStatisticTransactionsController,
  getTransactionByIdController,
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

router.get(
  "/statistic",
  verifyTokens,
  verifyRole(["EVENT_ORGANIZER"]),
  getStatisticTransactionsController
);

router.get(
  "/attendance",
  verifyTokens,
  verifyRole(["EVENT_ORGANIZER"]),
  getAttendeeListController
);

router.get(
  "/waiting",
  verifyTokens,
  verifyRole(["EVENT_ORGANIZER"]),
  getWaitingTransactionController
);

router.get(
  "/:id",
  verifyTokens,
  verifyRole(["CUSTOMER"]),
  getTransactionByIdController
);

router.post(
  "/",
  verifyTokens,
  verifyRole(["CUSTOMER"]),
  createTransactionController
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

export default router;
