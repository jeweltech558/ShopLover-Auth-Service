const express = require("express");
const router = express.Router();
const { validate, auth, idChecker } = require("../middlewares");
const CustomerValidation = require("../validations/customer.validation");
const CustomerController = require("../controllers/customer.controller");
const { singleImageUpload } = require("../middlewares/multer");

router.post(
  "/signup",
  validate(CustomerValidation.createValidation),
  CustomerController.createController
);
router.post(
  "/email-confirmation",
  validate(CustomerValidation.emailConfirmValidation),
  CustomerController.emailConfirmationContoller
);

router.post(
  "/resend-confirmation-email",
  validate(CustomerValidation.createValidation),
  CustomerController.createController
);

router.post(
  "/login",
  validate(CustomerValidation.loginValidation),
  CustomerController.loginController
);

router.patch(
  "/resetPassword",
  validate(CustomerValidation.resetPasswordValidation),
  CustomerController.resetPasswordContoller
);

router.put(
  "/resetPassword/new",
  validate(CustomerValidation.newPasswordValidation),
  CustomerController.newPasswordContoller
);

router.put(
  "/changePassword",
  auth,
  validate(CustomerValidation.changePasswordValidation),
  CustomerController.changePasswordController
);

router.post(
  "/refresh-token",
  validate(CustomerValidation.refreshTokenValidation),
  CustomerController.refreshToken
);

// router.put(
//   "/info/general",
//   auth,
//   validate(CustomerValidation.customerAddressInfoValidation),
//   CustomerController.updateCustomerGeneralInfoController
// );



router.post("/logout", CustomerController.logout);

module.exports = router;
