import request from "supertest";

import { app } from "../src/app";
import Task from "../src/models/task";
import {
  userOne,
  userTwo,
  setupDatabase,
  taskOne,
  taskTwo,
  taskThree,
} from "./fixtures/db";

beforeEach(setupDatabase);

test("Should create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ description: "task one" })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.owner.toString()).toBe(userOne._id.toString());
  expect(task.description).toBe("task one");
  expect(task.completed).toBe(false);
});

test("Shouldn't create task for unauthorized user", async () => {
  await request(app)
    .post("/tasks")
    .send({ description: "task one" })
    .expect(401);
});

test("Shouldn't create task with invalid data", async () => {
  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ completed: true })
    .expect(400);
});

test("Should get all tasks for user one", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body).toHaveLength(2);
});

test("Should get completed tasks for user one", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .query({ completed: "true" })
    .send()
    .expect(200);

  expect(response.body).toHaveLength(1);
});

test("Should get uncompleted tasks for user one", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .query({ completed: "false" })
    .send()
    .expect(200);

  expect(response.body).toHaveLength(1);
});

test("Should get latest 1 task for user one", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .query({ sortAt: "createdAt_desc", limit: 1 })
    .send()
    .expect(200);

  expect(response.body).toHaveLength(1);
  expect(response.body[0].description).toBe(taskTwo.description);
});

test("Should delete taskOne by userOne", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .query({ id: taskOne._id })
    .send()
    .expect(200);

  const task = await Task.findById(taskOne._id);
  expect(task).toBeNull();
});

test("Shouldn't delete taskOne by userTwo", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .query({ id: taskOne._id })
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});

test("Should get taskOne by userOne", async () => {
  const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .query({ id: taskOne._id })
    .send()
    .expect(200);

  expect(response.body).toMatchObject(taskOne);
});

test("Shouldn't get taskOne by userTwo", async () => {
  await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .query({ id: taskOne._id })
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});

test("Should update taskOne by userOne", async () => {
  const response = await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .query({ id: taskOne._id })
    .send({ completed: true })
    .expect(200);

  const task = await Task.findById(taskOne._id);
  expect(task.completed).toBe(true);
});

test("Shouldn't update taskOne by userTwo", async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .query({ id: taskOne._id })
    .send({ completed: true })
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task.completed).toBe(false);
});
