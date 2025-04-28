import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getEventDetailService = async (slug: string) => {
  const event = await prisma.event.findFirst({
    where: { slug, deletedAt: null },
  });

  if (!event) {
    throw new ApiError("invalid event slug", 401);
  }

  return { message: `ini adalah data event ${slug}`, event: event };
};
