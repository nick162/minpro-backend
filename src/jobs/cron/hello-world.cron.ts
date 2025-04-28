import { scheduleJob } from "node-schedule";

// scheduleJob("job-running-every-time-10-second", "*/10 * * * * *", () => {
//   console.log("hello world");
// });

scheduleJob("job-running-every-time-1-minute", "* * * * *", () => {
  console.log("hahahhhaha");
});
