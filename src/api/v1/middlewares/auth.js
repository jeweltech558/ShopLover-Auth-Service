const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1] || null;

  if (token === null) {
    return res.status(httpStatus.UNAUTHORIZED).send({
      status: httpStatus.UNAUTHORIZED,
      data: { error: "You have to login first." },
    });
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
      if (err) {
        return res.status(httpStatus.UNAUTHORIZED).send({
          status: httpStatus.UNAUTHORIZED,
          data: { error: "Expired Or Invalid Access Token !" },
        });
      } else {
        req.user = decoded;
        return next();
      }
    });
  }
};

module.exports = authenticateToken;
