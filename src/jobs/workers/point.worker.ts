import { Worker } from "bullmq";
import { redisConnection } from "../../lib/redis";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const pointWorker = new Worker(
  "user-point-queue",
  async (job) => {
    const { userId, points, type } = job.data;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!user) throw new ApiError("User not found", 404);

    await prisma.point.create({
      data: {
        userId,
        amount: points,
        validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 3 bulan
      },
    });
  },
  { connection: redisConnection }
);
