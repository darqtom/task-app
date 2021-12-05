import mongoose from "mongoose";

const connect = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api", {
      useNewUrlParser: true,
    });
  } catch (error) {
    console.log();
  }
};

export default connect;
