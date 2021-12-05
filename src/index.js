import express, { Router } from "express";
import connectDB from "./db/mongoose";

import userRouter from "./routers/user";
import taskRouter from "./routers/task";
import { auth } from "./middleware/auth";

const app = express();
const port = process.env.port || 3000;

app.use(express.json());
app.use("/users", userRouter);
app.use("/tasks", auth, taskRouter);

connectDB();

app.listen(port, () => {
  console.log("Server is running on port: ", port);
});
