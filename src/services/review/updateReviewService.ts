import { Review } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const updateReview = async (
  id: number,
  body: Partial<Omit<Review, "id" | "createdAt" | "updatedAt" | "deletedAt">>
) => {
  const review = await prisma.review.findFirst({
    where: { id, deletedAt: null },
  });

  if (!review) {
    throw new ApiError("Review not found", 404);
  }

  const updatedReview = await prisma.review.update({
    where: { id },
    data: body,
  });

  return updatedReview;
};
