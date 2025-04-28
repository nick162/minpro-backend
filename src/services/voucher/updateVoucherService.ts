import { Voucher } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export async function updateVoucher(id: number, body: Voucher) {
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
    data: body,
  });
}
