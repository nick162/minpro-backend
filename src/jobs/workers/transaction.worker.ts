import { Worker } from "bullmq";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { redisConnection } from "../../lib/redis";

export const userTransactionWorker = new Worker(
  "user-transaction-queue",
  async (job) => {
    // add logic here
    // Cek transaksi berrdasarkan uuid
    // if status is waiting for payment
    // update the transation into expired
    // just rollback the stock based on qty
    // is the status is other than waiting for payment, dont make an action
    const uuid = job.data.uuid;

    const transaction = await prisma.transaction.findFirst({
      where: { uuid },
    });

    if (!transaction) {
      throw new ApiError("invalid transaction uiid", 400);
    }

    if (transaction.status === "WAITING_PAYMENT") {
      await prisma.$transaction(async (tx) => {
        // proses 1
        await tx.transaction.update({
          where: { uuid },
          data: { status: "EXPIRED" },
        });

        //where 2
        await tx.ticket.update({
          where: { id: transaction.ticketId },
          data: { stock: { increment: transaction.quantity } },
        });
      });
    }
  },
  { connection: redisConnection }
);
