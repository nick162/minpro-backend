import { Router } from "express";
import {
  createReviewController,
  deleteReviewController,
  getReviewByIdController,
  getReviewsController,
  updateReviewController,
} from "../controllers/reviewController";

const router = Router();

// CREATE
router.post("/", createReviewController);

// READ ALL
router.get("/", getReviewsController);

// READ ONE
router.get("/:id", getReviewByIdController);

// UPDATE
router.put("/:id", updateReviewController);

// DELETE (soft delete)
router.delete("/:id", deleteReviewController);

export default router;
