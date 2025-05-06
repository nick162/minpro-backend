import { Worker } from "bullmq";
import { redisConnection } from "../../lib/redis";
import prisma from "../../config/prisma";

export const transactionWorker = new Worker(
  "transaction",
  async (job) => {
    const { transactionId, action } = job.data;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        transactionDetails: { include: { ticket: true } },
      },
    });

    if (!transaction || transaction.deletedAt) return;

    if (action === "ACCEPT") {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "SUCCESS" },
      });
    }

    if (action === "REJECT") {
      await prisma.$transaction(async (tx) => {
        await Promise.all(
          transaction.transactionDetails.map((detail) =>
            tx.ticket.update({
              where: { id: detail.ticketId },
              data: {
                availableSeats: { increment: detail.qty },
              },
            })
          )
        );

        await Promise.all(
          transaction.transactionDetails.map((detail) =>
            tx.transactionDetail.update({
              where: { id: detail.id },
              data: { deletedAt: new Date() },
            })
          )
        );

        await tx.transaction.update({
          where: { id: transactionId },
          data: { status: "REJECT" },
        });
      });
    }
  },
  { connection: redisConnection }
);
