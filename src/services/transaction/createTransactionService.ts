// import dayjs from "dayjs";
// import { ApiError } from "../../utils/api-error";
// import prisma from "../../config/prisma";
// import { Transaction } from "@prisma/client";

// interface CreateTransactionInput {
//   userId: number;
//   eventId: number;
//   ticketId: number;
//   quantity: number;
//   pointsToUse?: number;
//   couponId?: number;
//   voucherId?: number;
// }

// export const createTransactionService = async (data: CreateTransactionInput) => {
//   const {
//     userId,
//     eventId,
//     ticketId,
//     quantity,
//     pointsToUse = 0,
//     couponId,
//     voucherId,
//   } = data;

//   if (quantity < 1) throw new ApiError("Minimal beli 1 tiket",400);

//   const user = await prisma.user.findUnique({ where: { id: userId } });
//   if (!user) throw new ApiError("User tidak ditemukan",404);

//   const event = await prisma.event.findFirst({ where: { id: eventId, deletedAt: null } });
//   if (!event) throw new ApiError("Event tidak tersedia",404 );

//   const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
//   if (!ticket || ticket.eventId !== eventId) throw new ApiError("Tiket tidak valid",404);

//   let totalPrice = ticket.price * quantity;

//   let voucher = null;
//   if (voucherId) {
//     voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });
//     if (!voucher || !voucher.active) throw new ApiError(400, "Voucher tidak valid");
//     totalPrice -= voucher.discountAmount;
//   }

//   let coupon = null;
//   if (couponId) {
//     coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
//     if (!coupon || coupon.used || dayjs().isAfter(coupon.expiredAt))
//       throw new ApiError(400, "Kupon tidak valid atau sudah kadaluarsa");
//     totalPrice -= coupon.discount;
//   }

//   const availablePoints = await prisma.pointsHistory.aggregate({
//     where: { userId, expiredAt: { gte: new Date() } },
//     _sum: { points: true },
//   });

//   const totalPoints = availablePoints._sum.points || 0;
//   if (pointsToUse > totalPoints)
//     throw new ApiError(400, `Poin tidak mencukupi. Maks: ${totalPoints}`);

//   const discountFromPoints = pointsToUse;
//   totalPrice -= discountFromPoints;

//   if (totalPrice < 0) totalPrice = 0;

//   // Simpan transaksi
//   const transaction = await prisma.transaction.create({
//     data: {
//       userId,
//       eventId,
//       ticketId,
//       quantity,
//       totalPrice,
//       discountFromPoints,
//       couponId,
//       voucherId,
//       transcationSt: "PENDING",
//       expiresAt: dayjs().add(30, "minutes").toDate(),
//     },
//   });

//   // Tandai kupon sebagai digunakan
//   if (couponId) {
//     await prisma.coupon.update({ where: { id: couponId }, data: { used: true } });
//   }

//   // Potong poin
//   if (pointsToUse > 0) {
//     await prisma.pointsHistory.create({
//       data: {
//         userId,
//         transactionId: transaction.id,
//         points: -pointsToUse,
//         type: "REDEEMED",
//         expiredAt: dayjs().add(3, "months").toDate(),
//       },
//     });
//   }

//   return transaction;
// };
