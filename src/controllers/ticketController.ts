import { Request, Response, NextFunction } from "express";
import { createTicketService } from "../services/ticket/createTicketService";
import { getTicketsService } from "../services/ticket/getTicketsService";
import { getTicketService } from "../services/ticket/getTicketService";
import { deleteTicketService } from "../services/ticket/deleteTickerService";
import { updateTicketService } from "../services/ticket/updateTicketService";

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
    const { id, sold } = req.body;

    if (!id || typeof id !== "number") {
      throw new Error("Ticket id is required and must be a number");
    }
    if (!sold || typeof sold !== "number") {
      throw new Error("Sold value is required and must be a number");
    }

    const result = await updateTicketService(id, sold);
    res.status(200).send(result);
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
export const getTicketController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getTicketService(Number(req.params.id));
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
export const deleteicketController = async (
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
