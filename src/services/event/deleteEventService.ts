import prisma from "../../config/prisma";
import { cloudinaryRemove } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

export const deleteEventService = async (id: number, authUserId: number) => {
  const event = await prisma.event.findFirst({
    where: { id: Number(id) },
    include: { user: true },
  });

  if (event?.userId !== authUserId) {
    throw new ApiError("Unatuhorized", 401);
  }

  await cloudinaryRemove(event.eventName);

  await prisma.event.update({
    where: { id },
    data: { deletedAt: new Date(), thumbnail: "" },
  });
};
