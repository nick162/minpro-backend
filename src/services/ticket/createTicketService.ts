import { Ticket } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

interface CreateTicketPayload {
  eventId: number;
  ticketType: string;
  availableSeats: number;
  price: number;
}

export const createTicketService = async (body: CreateTicketPayload) => {
  const { eventId, ticketType, availableSeats, price } = body;

  // 1. Cek apakah ticket type untuk event ini sudah ada
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      eventId,
      ticketType,
    },
  });

  if (existingTicket) {
    throw new ApiError("The ticket type already exists for this event", 400);
  }

  // 2. Buat ticket baru
  const newTicket = await prisma.ticket.create({
    data: {
      eventId,
      ticketType,
      availableSeats,
      price,
      sold: 0, // default sold 0 saat create
    },
  });

  return {
    message: "Ticket created successfully",
    ticket: newTicket,
  };
};
