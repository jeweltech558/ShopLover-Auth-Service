const Joi = require("joi");
class Customer {
  createValidation = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().label("Last Name"),
    email: Joi.string()
      .email()
      .required()
      .regex(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      )
      .label("Email"),
    password: Joi.string()
      .min(6)
      .max(20)
      .required()
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,20}$/)
      .label(
        "Invalid Password.\nPassword Should be 8 characters\nPassword Should have a Uppercase letter\nPassword Should have a Lowercase Letter\nPassword Should Have a Number\nPassweord Should Have a special character(!,@,#,$)"
      ),

    salt: Joi.string(),
    phone: Joi.string().required().label("Phone"),
  });

  UpdateMarchantGeneralValidation = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().label("Last Name"),
    phone: Joi.string().required().label("Phone"),
  });

  loginValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(6)
      .max(20)
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,20}$/)
      .required(),
  });
  resetPasswordValidation = Joi.object({
    email: Joi.string().email().required().label("Email"),
  });

  changePasswordValidation = Joi.object({
    prevPassword: Joi.string().required().label("Previous Password"),
    password: Joi.string()
      .min(6)
      .max(20)
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,20}$/)
      .required()
      .label("Password"),
    confirmPassword: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .label("Confirm password")
      .options({ messages: { "any.only": "{{#label}} does not match" } }),
  });

  emailConfirmValidation = Joi.object({
    confirmToken: Joi.string().required().label("Confirm Token"),
  });

  refreshTokenValidation = Joi.object({
    refreshToken: Joi.string().required().label("Refresh Token"),
  });
  newPasswordValidation = Joi.object({
    resetToken: Joi.string().required(),

    password: Joi.string()
      .min(6)
      .max(20)
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,20}$/)
      .required()
      .label("Password"),

    confirmPassword: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .label("Confirm password")
      .options({ messages: { "any.only": "{{#label}} does not match" } }),
  });

  marchantBusinessInfoValidation = Joi.object({
    nationalId: Joi.string().required().label("National ID"),
    marchantTin: Joi.string().allow(""),
    national_id_image: Joi.any().label("National ID Image"),
    images: Joi.any(),
    addressInfo: Joi.any(),
  });

  marchantAddressInfoValidation = Joi.object().keys({
    country: Joi.string().required(),
    division: Joi.string().required(),
    city: Joi.string().allow(""),
    zip: Joi.string().allow(""),
    address: Joi.string().allow(""),
  });

  marchantBankInfoValidation = Joi.object({
    accountNo: Joi.string().required().label("Account No"),
    routeNo: Joi.any(),
    branchName: Joi.string().required().label("Branch Name"),
    bankName: Joi.string().label("Bank Name"),
    accountTitle: Joi.string().label("Account Title"),
  });
  marchantRtnAddressInfoValidation = Joi.object({
    name: Joi.string().required(),
    mobile: Joi.string().required(),
    country: Joi.string().required(),
    division: Joi.string().required(),
    city: Joi.string().allow(""),
    zip: Joi.string().allow(""),
    address: Joi.string().allow(""),
  });
}

module.exports = new Customer();
