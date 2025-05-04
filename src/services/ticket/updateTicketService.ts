import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

interface UpdateTicketInput {
  ticketType?: string;
  price?: number;
  availableSeats?: number;
  sold?: number; // optional, jika ingin menambahkan sold
}

export const updateTicketService = async (
  id: number,
  input: UpdateTicketInput
) => {
  const ticket = await prisma.ticket.findFirst({
    where: { id, deletedAt: null },
  });

  if (!ticket) {
    throw new ApiError("Ticket not found", 404);
  }

  let updatedSold = ticket.sold;
  let updatedAvailableSeats = ticket.availableSeats;

  // Jika `sold` ingin ditambahkan
  if (input.sold !== undefined) {
    const seatsAfterSold = ticket.availableSeats - input.sold;
    if (seatsAfterSold < 0) {
      throw new ApiError("Not enough seats available", 400);
    }

    updatedSold = ticket.sold + input.sold;
    updatedAvailableSeats = seatsAfterSold;
  }

  // Jika availableSeats diubah secara langsung
  if (input.availableSeats !== undefined) {
    updatedAvailableSeats = input.availableSeats;
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id },
    data: {
      ticketType: input.ticketType ?? ticket.ticketType,
      price: input.price ?? ticket.price,
      sold: updatedSold,
      availableSeats: updatedAvailableSeats,
    },
  });

  return { message: "Ticket updated successfully", data: updatedTicket };
};
