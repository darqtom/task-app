import express from "express";
import connectDB from "./db/mongoose";

import userRouter from "./routers/user";
import taskRouter from "./routers/task";
import { auth } from "./middleware/auth";

const app = express();

app.use(express.json());
app.use("/users", userRouter);
app.use("/tasks", auth, taskRouter);

connectDB();

export { app };
