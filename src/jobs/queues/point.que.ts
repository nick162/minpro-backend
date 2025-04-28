import { Queue } from "bullmq";
import { redisConnection } from "../../lib/redis";

export const pointQueue = new Queue("user-point-queue", {
  connection: redisConnection,
});
