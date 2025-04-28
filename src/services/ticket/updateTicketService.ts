import { Ticket } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const updateTicketService = async (id: number, sold: number) => {
  // Cari tiket berdasarkan ID
  const ticket = await prisma.ticket.findFirst({
    where: { id, deletedAt: null },
  });

  if (!ticket) {
    throw new ApiError("Ticket not found", 404);
  }

  // Hitung available seats baru
  const updatedAvailableSeats = ticket.availableSeats - sold;
  if (updatedAvailableSeats < 0) {
    throw new ApiError("Not enough seats available", 400);
  }

  // Update ticket
  const updatedTicket = await prisma.ticket.update({
    where: { id },
    data: {
      sold: ticket.sold + sold,
      availableSeats: updatedAvailableSeats,
    },
  });

  return { message: "Ticket updated successfully", data: updatedTicket };
};
