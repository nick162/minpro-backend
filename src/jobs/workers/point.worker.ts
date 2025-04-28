import { Worker } from "bullmq";
import { redisConnection } from "../../lib/redis";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const pointWorker = new Worker(
  "user-point-queue",
  async (job) => {
    const { userId, points, type } = job.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ApiError("User not found", 404);

    // Tambah point ke user
    const amount = 0;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { points: { increment: points } },
      }),
      prisma.pointsHistory.create({
        data: {
          userId,
          type,
          points,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 * 3),
        },
      }),
    ]);
  },
  { connection: redisConnection }
);
