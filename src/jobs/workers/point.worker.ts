import { Worker } from "bullmq";
import prisma from "../../config/prisma";
import { redisConnection } from "../../lib/redis";

export const pointWorker = new Worker(
  "user-point-queue",
  async (job) => {
    try {
      const { userId, amount, action, source = "UNKNOWN" } = job.data;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");

      const isAddition = action === "INCREASE";

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            totalPoint: {
              [isAddition ? "increment" : "decrement"]: amount,
            },
          },
        }),
        prisma.point.create({
          data: {
            userId,
            amount,
            validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 3 bulan
          },
        }),
        prisma.pointsHistory.create({
          data: {
            userId,
            amount,
            type: isAddition ? "IN" : "OUT",
            source,
          },
        }),
      ]);

      console.log(`[POINT WORKER] Success for user ${userId}`);
    } catch (error) {
      console.error("[POINT WORKER] Error:", error);
      throw error;
    }
  },
  { connection: redisConnection }
);
