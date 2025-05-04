import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getTicketByIdService = async (id: number) => {
  const ticket = await prisma.ticket.findFirst({
    where: { id, deletedAt: null },
  });

  if (!ticket) {
    throw new ApiError("Ticket not found", 404);
  }

  return { data: ticket };
};
