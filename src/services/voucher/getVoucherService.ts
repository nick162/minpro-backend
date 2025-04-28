import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getVoucherByIdService = async (id: number) => {
  const voucher = await prisma.voucher.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!voucher) {
    throw new ApiError("Voucher not found", 404);
  }

  return voucher;
};
