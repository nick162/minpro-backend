import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { generateSlug } from "../../utils/generalUtils";
import { Event } from "@prisma/client";

export const updateEventService = async (
  id: number,
  userId: number,
  body: Partial<Event>,
  thumbnail?: Express.Multer.File
) => {
  // 1. Check if event exists
  const existingEvent = await prisma.event.findUnique({ where: { id } });
  if (!existingEvent) {
    throw new ApiError("Event not found", 404);
  }

  if (existingEvent.userId !== userId) {
    throw new ApiError("You are not authorized to update this event", 403);
  }

  // 2. If name is provided, generate new slug
  if (body.eventName) {
    body.slug = generateSlug(body.eventName);
  }

  // 3. Convert numeric fields if provided

  if (body.userId) body.userId = Number(body.userId);

  // 4. If thumbnail is provided, upload to Cloudinary
  if (thumbnail) {
    const { secure_url } = await cloudinaryUpload(thumbnail);
    body.thumbnail = secure_url;
  }

  // 5. Update event
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: body,
  });

  return {
    message: "Event has been updated successfully",
    event: updatedEvent,
  };
};
