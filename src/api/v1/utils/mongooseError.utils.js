const ApiError = require("../errors/ErrorHandler");

const errorHandler = (err, req, res, next) => {
  console.log(err);

  let error = { ...err };
  error.message = err.message;

  // Mongoose Bad ObjectId
  if (err.name === "CastError") {
    const message = "Ressource not found";
    return new ApiError(message, 404);
  }

  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    return new ApiError(message, 400);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    return new ApiError(message, 400);
  }

  else{
    
  }
};

module.exports = errorHandler;
