import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { app } from "../src/app";
import User from "../src/models/user";

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

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Dariusz",
      email: "dariusz@dariusz.com",
      password: "dariusz",
    })
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: { name: "Dariusz", email: "dariusz@dariusz.com" },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe("dariusz");
});

test("Shouldn't signup an existing user", async () => {
  await request(app).post("/users").send(userOne).expect(400);
});

test("Should signin an existing user", async () => {
  const response = await request(app)
    .post("/users/signin")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();
  expect(response.body.token).toBe(user.tokens[2].token);
});

test("Shouldn't signin non-existing user (incorrect password)", async () => {
  await request(app)
    .post("/users/signin")
    .send({
      email: userOne.email,
      password: "test",
    })
    .expect(400);
});

test("Shouldn't signin non-existing user (incorrect email)", async () => {
  await request(app)
    .post("/users/signin")
    .send({
      email: "dariusz@dariusz.com",
      password: userOne.password,
    })
    .expect(400);
});

test("Should get user profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Shouldn't get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete user profile", async () => {
  const response = await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(response.body._id);
  expect(user).toBeNull();
});

test("Shouldn't delete profile for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should upload user avatar", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "./tests/fixtures/profile-pic.jpg")
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

describe("Getting user avatar", () => {
  beforeEach(async () => {
    await request(app)
      .post("/users/me/avatar")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .attach("avatar", "./tests/fixtures/profile-pic.jpg")
      .expect(200);

    const user = await User.findById(userOne._id);
    expect(user.avatar).toEqual(expect.any(Buffer));
  });

  test("Should get user avatar", async () => {
    await request(app).get(`/users/${userOne._id}/avatar`).expect(200);

    const user = await User.findById(userOne._id);
    expect(user.avatar).toEqual(expect.any(Buffer));
  });

  test("Shouldn't get unexisting user avatar", async () => {
    await request(app).get(`/users/12345/avatar`).expect(404);
  });
});

test("Should get user avatar", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "./tests/fixtures/profile-pic.jpg")
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Shouldn't upload invalid user avatar (pdf file)", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "./tests/fixtures/sample-pdf-file.pdf")
    .expect(400);
});

test("Should delete user avatar", async () => {
  await request(app)
    .delete("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user.avatar).toBeUndefined();
});

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ name: "Edward" })
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user.name).toBe("Edward");
});

test("Shouldn't update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ name: "Edward", location: "Cracow" })
    .expect(400);
});

test("Should signout user from one device", async () => {
  await request(app)
    .post("/users/signout")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user.tokens).toHaveLength(1);
});

test("Should signout user from all devices", async () => {
  await request(app)
    .post("/users/signoutall")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user.tokens).toHaveLength(0);
});

test("Should get all users", async () => {
  const response = await request(app)
    .get("/users")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body).toHaveLength(1);
});
