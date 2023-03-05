const { Schema, model, default: mongoose } = require("mongoose");
const logger = require("../scripts/logger/marchant.log");
const { getUtcDateTime } = require("../utils/date.time");

const marchantSchema = new Schema(
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

marchantSchema.post("save", (doc, next) => {
  logger.log({
    level: "info",
    message: doc,
  });
  next();
});

const addressSchema = new mongoose.Schema({
  type: String,
  country: String,
  division: String,
  district: String,
  subDistrict: String,
  area: String,
  streetAddress: String,
  isDefault: Boolean,
});

const returnAddressSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  country: String,
  division: String,
  city: String,
  zip: String,
  address: String,
});

const bankSchema = new mongoose.Schema({
  accountNo: String,
  routeNo: String,
  branchName: String,
  bankName: String,
  accountTitle: String,
});

const marchantInfoSchema = new Schema(
  {
    marchant: { type: Schema.Types.ObjectId, ref: "marchant" },
    marchantId: { type: Number, required: true },
    nationalId: { type: String },
    marchantTin: { type: String },
    nationalIdImage: { type: String },
    addressInfo: addressSchema,
    bankInfo: bankSchema,
    returnAddress: returnAddressSchema,
  },
  {
    toJSON: {
      transform(doc, ret) {
        // ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
    versionKey: false,
    timestamps: true,
  }
);



module.exports = {
  marchantSchema: model("marchant", marchantSchema),
  marchantInfoSchema: model("marchant_info", marchantInfoSchema),
};
