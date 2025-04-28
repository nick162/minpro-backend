import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getReviewById = async (id: number) => {
  const review = await prisma.review.findFirst({
    where: { id, deletedAt: null },
    include: {
      event: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!review) {
    throw new ApiError("Review not found", 404);
  }

  return review;
};
