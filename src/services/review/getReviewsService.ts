import prisma from "../../config/prisma";

export const getReviews = async () => {
  const reviews = await prisma.review.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      event: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return reviews;
};
