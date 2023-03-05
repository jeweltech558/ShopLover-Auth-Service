const httpStatus = require("http-status");
const multer = require("multer");
const ApiError = require("../errors/ErrorHandler");
require("dotenv").config();

const multerStorage = multer.memoryStorage();

const multerImageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(
      new ApiError(
        "Only JPG, JPEG, and PNG files are allowed",
        httpStatus.BAD_REQUEST
      )
    );
  }

  cb(null, true);
};
const maxSize = process.env.IMAGE_MAX_SIZE_IN_MB;

// For Single Image upload
var singleImageUpload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 1024 * 1024 * maxSize,
  },
  fileFilter: multerImageFilter,
});

// For Multiple Image upload
var multiImageUpload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 1024 * 1024 * maxSize,
    files: parseInt(process.env.PRODUCT_IMAGE_MAX_COUNT),
  },
  fileFilter: multerImageFilter,
});

module.exports = {
  singleImageUpload,
  multiImageUpload,
};
