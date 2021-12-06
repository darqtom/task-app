import { Router } from "express";
import sharp from "sharp";

import User from "../models/user.js";
import { auth } from "../middleware/auth";
import { avatarUpload } from "../middleware/upload";

const router = new Router();

router
  .route("/")
  .get(auth, async (req, res) => {
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
      const token = await user.generateAuthToken();
      return res.status(201).send({ user, token });
    } catch (error) {
      return res.status(400).send(error);
    }
  });

router.route("/signin").post(async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

router.route("/signout").post(auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();

    return res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.route("/signoutall").post(auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    return res.send();
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.route("/me").get(auth, async (req, res) => {
  res.send(req.user);
});

router
  .route("/me")
  .patch(auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((key) =>
      allowedUpdates.includes(key)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates" });
    }

    try {
      updates.forEach((update) => (req.user[update] = req.body[update]));
      await req.user.save();
      return res.send(req.user);
    } catch (error) {
      return res.status(400).send(error);
    }
  })
  .delete(auth, async (req, res) => {
    try {
      await req.user.remove();
      return res.send(req.user);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

router
  .route("/me/avatar")
  .post(
    auth,
    avatarUpload.single("avatar"),
    async (req, res) => {
      const buffer = await sharp(req.file.buffer)
        .png()
        .resize({ width: 250, height: 250 })
        .toBuffer();

      req.user.avatar = buffer;
      await req.user.save();

      res.send();
    },
    (error, req, res, next) => {
      return res.status(400).send({ error: error.message });
    }
  )
  .delete(auth, async (req, res) => {
    req.user.avatar = undefined;
    try {
      await req.user.save();
      return res.send();
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  });

router.route("/:id/avatar").get(async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);

    if (!user || !user.avatar) {
      throw new Error("No avatar found");
    }

    res.set("Content-Type", "image/png");
    return res.send(user.avatar);
  } catch (error) {
    return res.status(404).send({ error: error.message });
  }
});

export default router;
