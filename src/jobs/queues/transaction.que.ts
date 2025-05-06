import { Queue } from "bullmq";
import { redisConnection } from "../../lib/redis";

export const transactionQueue = new Queue("transaction", {
  connection: redisConnection,
});
