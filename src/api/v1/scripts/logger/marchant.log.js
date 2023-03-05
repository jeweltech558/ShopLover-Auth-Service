const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "marchant-service" },
  transports: [
    new winston.transports.File({
      filename: "src/api/v1/logs/marchant/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "src/api/v1/logs/marchant/info.log",
      level: "info",
    }),
    new winston.transports.File({
      filename: "src/api/v1/logs/marchant/combined.log",
    }),
  ],
});

module.exports = logger;
