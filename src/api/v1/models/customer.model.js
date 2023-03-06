const { Schema, model, default: mongoose } = require("mongoose");
const logger = require("../scripts/logger/marchant.log");
const { getUtcDateTime } = require("../utils/date.time");

const addressSchema = new mongoose.Schema({
  type: String,
  country: String,
  division: String,
  district: String,
  subDistrict: String,
  area: String,
  address: String,
  isDefault: Boolean,
});

const customerSchema = new Schema(
  {
    id: { type: Number, required: true },
    firstName: { type: String, required: [true, "First name is mandetory"] },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    salt: String,
    phone: { type: String, required: true, unique: true },
    verificationCode: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    passwordResetAt: { type: Date },
    statusId: { type: Number, required: true, default: 1 },
    refreshTokens: [{ type: String }],
    addressInfo: addressSchema,
  },
  {
    toJSON: {
      transform(doc, ret) {
        // ret.id = ret._id;
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.salt;
        delete ret.__v;
        return ret;
      },
    },
    versionKey: false,
    timestamps: true,
  }
);

customerSchema.post("save", (doc, next) => {
  logger.log({
    level: "info",
    message: doc,
  });
  next();
});




module.exports = {
  customerSchema: model("customer", customerSchema),
};
