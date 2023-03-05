const { counterSchema } = require("../models/counter.model");

const counter = (collectionName, prefix = null) => {
  return new Promise((resolve, reject) => {
    counterSchema
      .findOneAndUpdate(
        { collection_Name: collectionName },
        { $inc: { sequence: 1 }, prefix: prefix },
        { upsert: true, new: true }
      )
      .then((counter) => resolve(counter.toObject()))
      .catch((err) => {
        console.log(err);
      });
  });
};
module.exports = { counter };
