import mongoose from "mongoose";
import validator from "validator";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";

import Task from "./task";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password is invalid");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { toJSON: { virtuals: true }, timestamps: true }
);

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "testsecret");

  user.tokens = [...user.tokens, { token }];
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error("Unable to login!");
  }

  const isMatch = await compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login!");
  }

  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    try {
      user.password = await hash(user.password, 8);
    } catch (error) {
      next(error);
    }
  }

  next();
});

userSchema.pre("remove", async function (next) {
  const user = this;
  try {
    await Task.deleteMany({ owner: user._id });
  } catch (error) {
    next(error);
  }

  next();
});

const User = mongoose.model("User", userSchema);

export default User;
