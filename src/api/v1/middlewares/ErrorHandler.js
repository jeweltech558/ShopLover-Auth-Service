const ApiError = require("../errors/ErrorHandler");

const Errorhandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.path = err?.path;

  // Mongoose Bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource Not Found !";
    error = new ApiError(message, 404, path);
  }

  if (err.code === 11000) {
    const message = "Duplicate Value !";
    error = new ApiError(message, 400, error.path);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    const path = Object.values(err.errors).map((value) => value.path);
    error = new ApiError(message[0], 400, path[0]);
  }
  const errorPath = error?.path;
  res.status(error.status || 500);
  res.send({
    status: error.status || 500,
    data: {
      [errorPath ? errorPath : "error"]:
        error.message || "Internal Server Error!",
    },
  });
};

module.exports = Errorhandler;
