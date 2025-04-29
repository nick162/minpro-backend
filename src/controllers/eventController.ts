import { createEventService } from "../services/event/createEventService";
import { Request, Response, NextFunction } from "express";
import { getEventDetailService } from "../services/event/getEventDetailService";
import { getEventsService } from "../services/event/getEventsService";
import { getEventByCategoryService } from "../services/event/getEventByCategory";
import { deleteEventService } from "../services/event/deleteEventService";
import { ApiError } from "../utils/api-error";
import { updateEventService } from "../services/event/updateEventService";

export const createEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    if (!user?.id) {
      throw new ApiError("Unauthorized: user ID not found", 401);
    }
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnail = files.thumbnail?.[0];
    const result = await createEventService(
      { ...req.body, userId: user.id },
      thumbnail
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const updateEventController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    if (!user?.id) {
      throw new ApiError("Unauthorized: user ID not found", 401);
    }

    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      throw new ApiError("Invalid event ID", 400);
    }

    const files =
      (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};
    const thumbnail = files?.thumbnail?.[0];

    const result = await updateEventService(
      eventId,
      user.id, // <- ini posisi userId yang benar
      req.body,
      thumbnail
    );

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
