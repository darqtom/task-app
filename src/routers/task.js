import { Router } from "express";
import Task from "../models/task.js";

const router = new Router();

router
  .route("/")
  .get(async (req, res) => {
    try {
      const tasks = await Task.find({});
      return res.send(tasks);
    } catch (error) {
      return res.status(500).send(error);
    }
  })
  .post(async (req, res) => {
    const task = new Task(req.body);

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
      const task = await Task.findById(_id);

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

    const allowedUpdates = ["description", "completed"];
    const isValidOperation = Object.keys(req.body).every((key) =>
      allowedUpdates.includes(key)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates" });
    }

    try {
      const task = await Task.findByIdAndUpdate(_id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!task) {
        return res.status(404).send();
      }

      return res.send(task);
    } catch (error) {
      return res.status(500).send(error);
    }
  })
  .delete(async (req, res) => {
    const _id = req.params.id;

    try {
      const task = await Task.findByIdAndDelete(_id);

      if (!task) {
        return res.status(404).send();
      }

      return res.send(task);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

export default router;
