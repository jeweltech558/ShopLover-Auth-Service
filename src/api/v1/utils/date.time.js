const moment = require("moment-timezone");

const getUtcDateTime = () => {
  return moment.utc().format();
};
module.exports = {
  getUtcDateTime,
};
