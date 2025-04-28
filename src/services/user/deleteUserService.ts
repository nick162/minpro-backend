import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const deleteUserPrismaService = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { id: Number(id) },
  });

  if (!user) {
    throw new ApiError("invalid user id", 400);
  }

  //   await prisma.user.delete({
  //     where: { id: Number(id) },
  //   });

  await prisma.user.update({
    where: { id: Number(id) },
    data: { deletedAt: new Date() },
  });

  return { message: "User has been deleted" };
};
