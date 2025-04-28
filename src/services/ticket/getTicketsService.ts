import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getTicketsService = async () => {
  const tickets = await prisma.ticket.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!tickets || tickets.length === 0) {
    throw new ApiError("No tickets found", 404);
  }

  return {
    message: "All available tickets",
    tickets,
  };
};
