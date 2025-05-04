import { Request, Response, NextFunction } from "express";
import { createTicketService } from "../services/ticket/createTicketService";
import { getTicketsService } from "../services/ticket/getTicketsService";

import { deleteTicketService } from "../services/ticket/deleteTickerService";
import { updateTicketService } from "../services/ticket/updateTicketService";
import { getTicketByIdService } from "../services/ticket/getTicketByIdService";

export const createTicketController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await createTicketService(req.body);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const updateTicketController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      throw new Error("Ticket ID is required and must be a number");
    }

    const {
      ticketType,
      price,
      availableSeats,
      sold,
    }: {
      ticketType?: string;
      price?: number;
      availableSeats?: number;
      sold?: number;
    } = req.body;

    const result = await updateTicketService(id, {
      ticketType,
      price,
      availableSeats,
      sold,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
export const getTicketsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getTicketsService();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
export const getTicketByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getTicketByIdService(Number(req.params.id));
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
export const deleteticketController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await deleteTicketService(Number(req.params.id));
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
