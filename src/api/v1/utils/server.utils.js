const express = require("express");
const cors = require("cors");

const HandleErrors = require("./errorHandler.utils");
const helmet = require("helmet");
const path = require("path");

module.exports = createServer = () => {
  const app = express();

  // app.use(
  //   "/api/v1/uploads",
  //   express.static(path.join(__dirname, "../", "uploads"))
  // );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(helmet());
  app.use(cors());

  // error handling
  app.use(HandleErrors);

  return app;
};
