import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const deleteReview = async (id: number) => {
  const review = await prisma.review.findFirst({
    where: { id, deletedAt: null },
  });

  if (!review) {
    throw new ApiError("Review not found", 404);
  }

  const deletedReview = await prisma.review.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return deletedReview;
};
