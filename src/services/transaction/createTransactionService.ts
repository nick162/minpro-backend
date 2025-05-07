import dayjs from "dayjs";
import crypto from "crypto";
import { ApiError } from "../../utils/api-error";
import prisma from "../../config/prisma";
import { PointsType } from "@prisma/client";
import { pointQueue } from "../../jobs/queues/point.que";
import { userTransactionQueue } from "../../jobs/queues/userTransaction.que";

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

  // Pastikan userId adalah integer
  const userIdInt = Number(userId); // Mengonversi userId menjadi angka (integer)

  if (isNaN(userIdInt)) {
    throw new ApiError("User ID tidak valid", 400); // Cek jika konversi gagal
  }

  if (quantity < 1) throw new ApiError("Minimal beli 1 tiket", 400);

  // 1. Cek apakah pengguna ada
  const user = await prisma.user.findUnique({ where: { id: userIdInt } });
  if (!user) throw new ApiError("User tidak ditemukan", 404);

  // 2. Cek apakah event ada
  const event = await prisma.event.findUnique({
    where: { id: eventId, deletedAt: null },
  });
  if (!event) throw new ApiError("Event tidak tersedia", 404);

  // 3. Cek apakah tiket ada dan valid
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket || ticket.eventId !== eventId)
    throw new ApiError("Tiket tidak valid", 404);

  // 4. Cek apakah tiket cukup tersedia
  if (ticket.availableSeats < quantity)
    throw new ApiError("Tiket tidak mencukupi", 400);

  let totalPrice = ticket.price * quantity;

  // 5. Cek apakah voucher valid
  let voucher = null;
  if (voucherId) {
    voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });
    if (!voucher || voucher.deletedAt || dayjs().isAfter(voucher.validUntil)) {
      throw new ApiError("Voucher tidak valid atau sudah kadaluarsa", 400);
    }
    totalPrice -= voucher.amount;
  }

  // 6. Cek apakah coupon valid
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

  // 7. Cek jumlah poin yang tersedia
  const availablePoints = await prisma.point.aggregate({
    where: {
      userId: userIdInt, // Menggunakan userId yang telah dikonversi
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

  // Melakukan transaksi dengan Prisma
  const transaction = await prisma.$transaction(async (tx) => {
    const trx = await tx.transaction.create({
      data: {
        userId: userIdInt, // Menggunakan userId yang telah dikonversi
        eventId,
        totalPrice,
        uuid,
        usedPoint: pointsToUse,
        status: "WAITING_FOR_PAYMENT",
      },
    });

    await tx.transactionDetail.create({
      data: {
        uuid: crypto.randomUUID(),
        transactionId: trx.id,
        ticketId,
        qty: quantity,
        price: ticket.price * quantity,
      },
    });

    await tx.ticket.update({
      where: { id: ticketId },
      data: {
        availableSeats: {
          decrement: quantity,
        },
      },
    });

    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedAt: new Date() },
      });
    }

    return trx;
  });

  // Menurunkan poin jika digunakan
  if (pointsToUse > 0) {
    await pointQueue.add("decrease-point", {
      userId: userIdInt, // Menggunakan userId yang telah dikonversi
      amount: pointsToUse,
      action: "OUT",
      source: `Penggunaan poin untuk transaksi ${uuid}`,
    });
  }

  // Menambahkan pekerjaan untuk memeriksa transaksi kadaluarsa
  await userTransactionQueue.add(
    "check-expired-transaction",
    { uuid },
    { delay: 1000 * 60 * 15 } // 15 menit
  );

  return transaction;
};
