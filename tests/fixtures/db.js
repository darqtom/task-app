import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Task from "../../src/models/task";

import User from "../../src/models/user";

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Mariusz",
  email: "mariusz@mariusz.com",
  password: "mariusz",
  tokens: [
    { token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET) },
    { token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET + 1) },
  ],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: "Tomasz",
  email: "tomasz@tomasz.com",
  password: "tomasz",
  tokens: [
    { token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET) },
    { token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET + 1) },
  ],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "one",
  completed: false,
  owner: userOne._id,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "two",
  completed: true,
  owner: userOne._id,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "three",
  completed: true,
  owner: userTwo._id,
};

const setupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

export {
  userOneId,
  userOne,
  setupDatabase,
  userTwo,
  userTwoId,
  taskOne,
  taskTwo,
  taskThree,
};
