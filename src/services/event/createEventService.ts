import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { generateSlug } from "../../utils/generalUtils";

// Buat tipe khusus hanya untuk input body yang dibutuhkan
interface CreateEventInput {
  eventName: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  cityId: string; // dari form-data, jadi string
  userId: number; // dari token (res.locals.user)
}

export const createEventService = async (
  body: CreateEventInput,
  thumbnail: Express.Multer.File
) => {
  // 1. Validasi
  if (!thumbnail) {
    throw new ApiError("Thumbnail is required", 400);
  }

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
      category: body.category as any,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      cityId: Number(body.cityId),
      userId: body.userId,
      thumbnail: secure_url, // ← ini penting
      slug: slug,
    },
  });

  return {
    message: "Event has been created successfully",
    event: newEvent,
  };
};
