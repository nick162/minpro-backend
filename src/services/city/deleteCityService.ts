import { Review } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const createReview = async (body: Review) => {
  const existingReview = await prisma.review.findUnique({
    where: { transactionId: body.transactionId },
  });

  if (existingReview) {
    throw new ApiError("Transaction already reviewed", 400);
  }

  const review = await prisma.review.create({
    data: body,
  });

  return review;
};
