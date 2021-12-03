import express, { Router } from "express";
import connectDB from "./db/mongoose.js";
import userRouter from "./routers/user.js";
import taskRouter from "./routers/task.js";

const app = express();
const port = process.env.port || 3000;

app.use(express.json());
app.use("/users", userRouter);
app.use("/tasks", taskRouter);

await connectDB();

app.listen(port, () => {
  console.log("Server is running on port: ", port);
});
