import { createEventService } from "../services/event/createEventService";
import { Request, Response, NextFunction } from "express";
import { getEventDetailService } from "../services/event/getEventDetailService";
import { getEventsService } from "../services/event/getEventsService";
import { getEventByCategoryService } from "../services/event/getEventByCategory";
import { deleteEventService } from "../services/event/deleteEventService";

export const createEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnail = files.thumbnail?.[0];
    const result = await createEventService(req.body, thumbnail);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const result = await getEventDetailService(slug);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getEventsByCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.params;
    const result = await getEventByCategoryService(category);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
export const getEventsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getEventsService();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const deleteEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = res.locals.user.id;
    const result = await deleteEventService(Number(req.params.id), authUserId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
