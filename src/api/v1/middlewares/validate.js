const httpStatus = require("http-status");

const validate = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details
      ?.map((detail) => detail.message)
      .join(",");
    const path = error.details?.map((detail) => detail.path[0]).join(",");
    res.status(httpStatus.BAD_REQUEST).send({
      status: httpStatus.BAD_REQUEST,
      data: { [path]: errorMessage },
    });
    return;
  } else {
    Object.assign(req, value);
    return next();
  }
};

module.exports = validate;
