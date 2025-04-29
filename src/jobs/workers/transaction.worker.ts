// src/jobs/workers/transaction.worker.ts
import { Worker } from "bullmq";
import prisma from "../../config/prisma";
import { redisConnection } from "../../lib/redis";

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
        await tx.transaction.update({
          where: { uuid },
          data: { status: "EXPIRED" },
        });

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
      });
    }
  },
  { connection: redisConnection }
);
