import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getEventsService = async () => {
  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { city: { select: { cityName: true } } },
  });

  if (!events || events.length === 0) {
    throw new ApiError("No events found", 404);
  }

  return {
    message: "All available events",
    events,
  };
};
