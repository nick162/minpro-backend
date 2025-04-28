import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const deleteTicketService = async (id: number) => {
  const ticket = await prisma.ticket.findFirst({
    where: { id: Number(id) },
  });

  if (!ticket) {
    throw new ApiError("the ticket name has been existed", 401);
  }

  await prisma.ticket.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
