import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getUserService = async (id: number) => {
  const user = await prisma.user.findFirst({
    where: { id: Number(id), deletedAt: null },
  });

  if (!user) {
    throw new ApiError("Invalid User ID", 401);
  }

  return {
    data: user,
  };
};
