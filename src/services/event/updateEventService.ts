import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { cloudinaryRemove, cloudinaryUpload } from "../../lib/cloudinary";
import { generateSlug } from "../../utils/generalUtils";
import { Event } from "@prisma/client";

export const updateEventService = async (
  id: number,
  authUserId: number,
  body: Partial<Event>,
  thumbnail?: Express.Multer.File
) => {
  const existingEvent = await prisma.event.findFirst({
    where: { id },
  });

  if (!existingEvent) {
    throw new ApiError("Event not found", 404);
  }

  if (existingEvent.userId !== authUserId) {
    throw new ApiError("Unauthorized", 403);
  }

  let newSlug = existingEvent.slug;

  if (body.eventName) {
    const EventName = await prisma.event.findFirst({
      where: { eventName: body.eventName },
    });

    if (EventName) {
      throw new ApiError("Event name already exist", 400);
    }

    newSlug = generateSlug(body.eventName);
  }

  let newThumbnail = existingEvent.thumbnail;

  if (thumbnail) {
    await cloudinaryRemove(existingEvent.thumbnail);
    const { secure_url } = await cloudinaryUpload(thumbnail);
    newThumbnail = secure_url;
  }

  return await prisma.event.update({
    where: { id },
    data: { ...body, slug: newSlug, thumbnail: newThumbnail },
  });
};
