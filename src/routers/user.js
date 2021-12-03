import { Router } from "express";
import User from "../models/user.js";

const router = new Router();

router
  .route("/")
  .get(async (req, res) => {
    try {
      const users = await User.find({});
      return res.send(users);
    } catch (error) {
      return res.status(500).send(error);
    }
  })
  .post(async (req, res) => {
    const user = new User(req.body);
    try {
      await user.save();
      return res.status(201).send(user);
    } catch (error) {
      return res.status(400).send(error);
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    const _id = req.params.id;

    try {
      const user = await User.findById(_id);
      if (!user) {
        return res.status(404).send();
      }

      return res.send(user);
    } catch (error) {
      return res.status(500).send(error);
    }
  })
  .patch(async (req, res) => {
    const _id = req.params.id;

    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = Object.keys(req.body).every((key) =>
      allowedUpdates.includes(key)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates" });
    }

    try {
      const user = await User.findByIdAndUpdate(_id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).send();
      }

      return res.send(user);
    } catch (error) {
      return res.status(400).send(error);
    }
  })
  .delete(async (req, res) => {
    const _id = req.params.id;

    try {
      const deletedUser = await User.findByIdAndDelete(_id);

      if (!deletedUser) {
        return res.status(404).send();
      }

      return res.send(deletedUser);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

export default router;
