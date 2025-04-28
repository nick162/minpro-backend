import { Voucher } from "@prisma/client";
import prisma from "../../config/prisma";

export const createVoucherService = async (body: Voucher) => {
  return prisma.voucher.create({
    data: body,
  });
};
