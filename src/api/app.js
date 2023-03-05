const { connection, createServer } = require("./v1/utils");
const config = require("./v1/config");
const events = require("./v1/scripts/events");
const Routes = require("./v1/routes/routes");
const ErrorHandler = require("./v1/middlewares/ErrorHandler");
const morgan = require("morgan");

config();
events();

const app = createServer();
const PORT = process.env.PORT || 9020;
const HOST = process.env.HOST;

app.listen(PORT, async () => {
  console.log(`listening to port http://${HOST}:${PORT}/api/v1`);
  app.use(morgan("dev"));
  await connection();

  app.use("/api/v1", Routes);

  app.use((req, res, next) => {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  app.use(ErrorHandler);
});
