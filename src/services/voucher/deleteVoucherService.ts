import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const deleteVoucherService = async (id: number) => {
  const existingVoucher = await prisma.voucher.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existingVoucher) {
    throw new ApiError("Voucher not found", 404);
  }

  return prisma.voucher.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
