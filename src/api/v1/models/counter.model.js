const { Schema, model, default: mongoose } = require("mongoose");

const counterSchema = new Schema(
  {
    collection_Name: { type: String, required: true },
    prefix: { type: String },
    sequence: { type: Number, required: true },
  },
  {
    toObject: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    versionKey: false,
    timestamps: true,
  }
);

module.exports = {
  counterSchema: model("counter", counterSchema),
};
