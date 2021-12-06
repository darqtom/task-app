import { Router } from "express";

import Task from "../models/task";

const router = new Router();

router
  .route("/")
  .get(async (req, res) => {
    const match = {};
    const options = {};

    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }

    if (req.query.limit) {
      options.limit = parseInt(req.query.limit);
    }

    if (req.query.skip) {
      options.skip = parseInt(req.query.skip);
    }

    try {
      await req.user.populate({
        path: "tasks",
        match,
        options,
      });
      return res.send(req.user.tasks);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })
  .post(async (req, res) => {
    const task = new Task({ ...req.body, owner: req.user._id });

    try {
      await task.save();
      return res.send(task);
    } catch (error) {
      return res.status(400).send(error);
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    const _id = req.params.id;

    try {
      const task = await Task.findOne({ _id, owner: req.user._id });

      if (!task) {
        return res.status(404).send();
      }

      return res.send(task);
    } catch (error) {
      return res.status(500).send(error);
    }
  })
  .patch(async (req, res) => {
    const _id = req.params.id;

    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = Object.keys(req.body).every((key) =>
      allowedUpdates.includes(key)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates" });
    }

    try {
      const task = await Task.findOne({ _id, owner: req.user._id });

      if (!task) {
        return res.status(404).send();
      }

      updates.forEach((update) => (task[update] = req.body[update]));
      await task.save();

      return res.send(task);
    } catch (error) {
      return res.status(500).send(error);
    }
  })
  .delete(async (req, res) => {
    const _id = req.params.id;

    try {
      const task = await Task.findOneAndDelete({ _id, owner: req.user._id });

      if (!task) {
        return res.status(404).send();
      }

      return res.send(task);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

export default router;
