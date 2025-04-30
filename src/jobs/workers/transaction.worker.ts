// src/jobs/workers/transaction.worker.ts
import { Worker } from "bullmq";
import prisma from "../../config/prisma";
import { redisConnection } from "../../lib/redis";
import { PointsType } from "@prisma/client";

export const userTransactionWorker = new Worker(
  "user-transaction-queue",
  async (job) => {
    const uuid = job.data.uuid;

    const transaction = await prisma.transaction.findUnique({
      where: { uuid },
    });

    if (!transaction) return;

    if (transaction.status === "WAITING_FOR_PAYMENT") {
      await prisma.$transaction(async (tx) => {
        // 1. Update status menjadi EXPIRED
        await tx.transaction.update({
          where: { uuid },
          data: { status: "EXPIRED" },
        });

        // 2. Kembalikan kursi tiket
        const detail = await tx.transactionDetail.findFirst({
          where: { transactionId: transaction.id },
        });

        if (detail) {
          await tx.ticket.update({
            where: { id: detail.ticketId },
            data: {
              availableSeats: {
                increment: detail.qty,
              },
            },
          });
        }

        // 3. Kembalikan poin user jika ada poin yang digunakan
        if (
          transaction.usedPoint &&
          transaction.usedPoint > 0 &&
          transaction.userId
        ) {
          await tx.user.update({
            where: { id: transaction.userId },
            data: {
              totalPoint: {
                increment: transaction.usedPoint,
              },
            },
          });

          // 4. Tambahkan riwayat pengembalian poin
          await tx.pointsHistory.create({
            data: {
              userId: transaction.userId,
              amount: transaction.usedPoint,
              type: PointsType.IN,
              source: `Pengembalian poin dari transaksi ${transaction.uuid} yang kedaluwarsa`,
            },
          });
        }
      });
    }
  },
  { connection: redisConnection }
);
