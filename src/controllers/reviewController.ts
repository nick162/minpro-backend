import { Request, Response, NextFunction } from "express";
import { createReview } from "../services/city/deleteCityService";
import { getReviews } from "../services/review/getReviewsService";
import { getReviewById } from "../services/review/getReviewService";
import { updateReview } from "../services/review/updateReviewService";
import { deleteReview } from "../services/review/deleteReviewService";

export const createReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newReview = await createReview(req.body);
    res.status(201).json({
      message: "Review created successfully",
      data: newReview,
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await getReviews();
    res.status(200).json({
      message: "Reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const review = await getReviewById(Number(id));
    res.status(200).json({
      message: "Review fetched successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updatedReview = await updateReview(Number(id), req.body);
    res.status(200).json({
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReviewController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deletedReview = await deleteReview(Number(id));
    res.status(200).json({
      message: "Review deleted successfully",
      data: deletedReview,
    });
  } catch (error) {
    next(error);
  }
};
