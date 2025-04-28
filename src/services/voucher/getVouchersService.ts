import prisma from "../../config/prisma";

export const getVouchersService = async () => {
  return await prisma.voucher.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
