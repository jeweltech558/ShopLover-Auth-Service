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

// router.get("/profile", auth, CustomerController.profileController);
// router.put(
//   "/info/general",
//   auth,
//   validate(CustomerValidation.UpdateMarchantGeneralValidation),

//   CustomerController.updateMarchantGeneralController
// );






// router.post(
//   "/update-profile-image",
//   auth,
//   singleImageUpload.single("profile_image"),
//   CustomerController.updateProfileImage
// );



// router.get(
//   "/info/:marchant_Id",
//   auth,
//   idChecker("marchant_Id"),
//   CustomerController.getMarchantInfoController
// );

// router.put(
//   "/info/business",
//   auth,
//   singleImageUpload.single("national_id_image"),
//   validate(CustomerValidation.marchantBusinessInfoValidation),
//   CustomerController.updateMarchantBusinessInfoController
// );

// router.get(
//   "/info/business/:marchant_Id",
//   auth,
//   idChecker("marchant_Id"),
//   CustomerController.getMarchantBusinessInfoController
// );

// router.put(
//   "/info/general",
//   auth,
//   validate(CustomerValidation.marchantAddressInfoValidation),
//   CustomerController.updateMarchantGeneralInfoController
// );

// router.get(
//   "/info/general/:marchant_Id",
//   auth,
//   idChecker("marchant_Id"),
//   CustomerController.getMarchantGeneralInfoController
// );

// router.put(
//   "/info/bank",
//   auth,
//   validate(CustomerValidation.marchantBankInfoValidation),
//   CustomerController.updateMarchantBankInfoController
// );

// router.get(
//   "/info/bank/:marchant_Id",
//   auth,
//   idChecker("marchant_Id"),
//   CustomerController.getMarchantBankInfoController
// );

// router.put(
//   "/info/return_address",
//   auth,
//   validate(CustomerValidation.marchantRtnAddressInfoValidation),
//   CustomerController.updateMarchantRtnAddressInfoController
// );

// router.get(
//   "/info/return_address/:marchant_Id",
//   auth,
//   idChecker("marchant_Id"),
//   CustomerController.getMarchantRtnAddressInfoController
// );

router.post("/logout", CustomerController.logout);

module.exports = router;
