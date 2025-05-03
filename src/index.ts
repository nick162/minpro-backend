import express from "express";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRouter from "./routes/authRouter";
import eventRouter from "./routes/eventRouter";
import ticketRouter from "./routes/ticketRouter";
import userRouter from "./routes/userRouter";

import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json()); // supaya bisa menerima request body

/* routes */

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/event", eventRouter);
app.use("/ticket", ticketRouter);
app.use("/transaction", ticketRouter);

/* midlleware */
app.use(errorMiddleware); // harus paling bawah, dibawah api endpoint

app.listen(PORT, () => {
  console.log(`server running at PORT ${PORT}`);
});
