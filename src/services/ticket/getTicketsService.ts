// services/ticket/getTicketsService.ts

import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getTicketsService = async () => {
  const tickets = await prisma.ticket.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  // Tidak perlu lempar error jika kosong
  return {
    message: "All available tickets",
    tickets,
  };
};
