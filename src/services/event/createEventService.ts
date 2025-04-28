import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { generateSlug } from "../../utils/generalUtils";
import { Event } from "@prisma/client";

export const createEventService = async (
  body: Event,
  thumbnail: Express.Multer.File
) => {
  // 1. Cek apakah nama event sudah ada
  const existingEvent = await prisma.event.findFirst({
    where: { eventName: body.eventName },
  });

  if (existingEvent) {
    throw new ApiError("Event already exists", 400);
  }

  // 2. Upload thumbnail ke Cloudinary
  const { secure_url } = await cloudinaryUpload(thumbnail);

  // 3. Generate slug
  const slug = generateSlug(body.eventName);

  // 4. Buat Event
  const newEvent = await prisma.event.create({
    data: {
      eventName: body.eventName,
      description: body.description,
      category: body.category,
      startDate: body.startDate,
      endDate: body.endDate,
      cityId: body.cityId,
      userId: body.userId,
      eventPict: secure_url,
      slug: slug,
    },
  });

  return {
    message: "Event has been created successfully",
    event: newEvent,
  };
};
