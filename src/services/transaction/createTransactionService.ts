import dayjs from "dayjs";
import { ApiError } from "../../utils/api-error";
import prisma from "../../config/prisma";
import { Prisma, PointsType } from "@prisma/client";
import crypto from "crypto";

interface CreateTransactionInput {
  userId: number;
  eventId: number;
  ticketId: number;
  quantity: number;
  pointsToUse?: number;
  couponId?: number;
  voucherId?: number;
}

export const createTransactionService = async (
  data: CreateTransactionInput
) => {
  const {
    userId,
    eventId,
    ticketId,
    quantity,
    pointsToUse = 0,
    couponId,
    voucherId,
  } = data;

  if (quantity < 1) throw new ApiError("Minimal beli 1 tiket", 400);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError("User tidak ditemukan", 404);

  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
  });
  if (!event) throw new ApiError("Event tidak tersedia", 404);

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket || ticket.eventId !== eventId)
    throw new ApiError("Tiket tidak valid", 404);

  if (ticket.availableSeats < quantity)
    throw new ApiError("Tiket tidak mencukupi", 400);

  let totalPrice = ticket.price * quantity;

  let voucher = null;
  if (voucherId) {
    voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });
    if (!voucher || voucher.deletedAt || dayjs().isAfter(voucher.validUntil)) {
      throw new ApiError("Voucher tidak valid atau sudah kadaluarsa", 400);
    }
    totalPrice -= voucher.amount;
  }

  let coupon = null;
  if (couponId) {
    coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (
      !coupon ||
      coupon.usedAt ||
      coupon.deletedAt ||
      dayjs().isAfter(coupon.validUntil)
    ) {
      throw new ApiError("Kupon tidak valid atau sudah kadaluarsa", 400);
    }
    totalPrice -= coupon.amount;
  }

  const availablePoints = await prisma.point.aggregate({
    where: {
      userId,
      deletedAt: null,
      validUntil: { gte: new Date() },
    },
    _sum: {
      amount: true,
    },
  });

  const totalPoints = availablePoints._sum.amount || 0;
  if (pointsToUse > totalPoints) {
    throw new ApiError(`Poin tidak mencukupi. Maks: ${totalPoints}`, 400);
  }

  totalPrice -= pointsToUse;
  if (totalPrice < 0) totalPrice = 0;

  const uuid = crypto.randomUUID();

  // Jalankan transaksi DB
  const transaction = await prisma.$transaction(async (tx) => {
    // 1. Buat transaksi
    const trx = await tx.transaction.create({
      data: {
        userId,
        eventId,
        totalPrice,
        uuid,
        usedPoint: pointsToUse,
        status: "WAITING_FOR_PAYMENT",
      },
    });

    // 2. Buat detail transaksi
    await tx.transactionDetail.create({
      data: {
        uuid: crypto.randomUUID(),
        transactionId: trx.id,
        ticketId,
        qty: quantity,
        price: ticket.price * quantity,
      },
    });

    // 3. Kurangi jumlah kursi tersedia
    await tx.ticket.update({
      where: { id: ticketId },
      data: {
        availableSeats: {
          decrement: quantity,
        },
      },
    });

    // 4. Tandai kupon sebagai sudah digunakan
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedAt: new Date() },
      });
    }

    // 5. Potong poin user dan simpan histori
    if (pointsToUse > 0) {
      await tx.user.update({
        where: { id: userId },
        data: {
          totalPoint: {
            decrement: pointsToUse,
          },
        },
      });

      await tx.pointsHistory.create({
        data: {
          userId,
          amount: -pointsToUse,
          type: PointsType.OUT,
          source: `Penggunaan poin untuk transaksi ${uuid}`,
          expiredAt: null,
        },
      });
    }

    return trx;
  });

  return transaction;
};
