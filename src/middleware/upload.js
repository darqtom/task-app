import multer from "multer";

const avatarUpload = multer({
  limits: 1000000,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jped|png)$/)) {
      return cb(
        new Error(
          "File must be an image with one of the following extensions: jpg, jpeg, png!"
        )
      );
    }
    return cb(undefined, true);
  },
});

export { avatarUpload };
