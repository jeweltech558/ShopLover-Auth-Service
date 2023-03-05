const { v4: uuidv4 } = require("uuid");
const eventEmitter = require("../scripts/events/eventEmitter");

const httpStatus = require("http-status");
const passwordToHash = require("../utils/helper.utils");

const {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  generateEmailConfirmToken,
} = require("../utils/jwt.utils");
const jwt = require("jsonwebtoken");
const CustomerService = require("../services/customer.service");
const ApiError = require("../errors/ErrorHandler");
const {
  saveToDisk,
  resizeImage,
  convertImage,
} = require("../utils/sharp.utils");

class Customer {
  async createController(req, res, next) {
    const { body } = req;

    /// Email Or Phone Validations
    if (
      (!body.email || body.phone) &&
      (body.email || !body.phone) &&
      (!body.email || !body.phone)
    ) {
      return next(
        new ApiError("Email or Phone is required", httpStatus.BAD_REQUEST)
      );
    }
    const password = passwordToHash(body.password);
    try {
      let marData = { ...body, password };
      const createdMarchant = await CustomerService.CreateMarchant(marData);


      let Marchant;
      if (!createdMarchant) {
        return next(
          new ApiError("Marchant Create Failed !", httpStatus.BAD_REQUEST)
        );
      } else {
        Marchant = createdMarchant.toObject();
        const confirmToken = generateEmailConfirmToken(Marchant);

        const templateData = {
          name: Marchant.firstName,
          confirmLink:
            process.env.FRONTEND_BASE_URL +
            `/marchant/email-confirmation?confirmToken=${confirmToken}`,
        };
        // ! eventEmitter
        eventEmitter.emit("send_email", {
          to: Marchant.email,
          subject: "ShopLover-Email Confirmation",
          templateName: "emailConfirmation",
          templateData: templateData,
          hasTemplate: true,
        });
        res.status(httpStatus.CREATED).send({
          status: "OK",
          data: { ...Marchant, confirmToken: confirmToken },
        });
      }
    } catch (error) {
      if (error?.message?.startsWith("Email already taken")) {
        return res.status(httpStatus.BAD_REQUEST).send({
          status: httpStatus.BAD_REQUEST,
          data: { email: "Email already taken!" },
        });
      } else if (error?.message?.startsWith("Phone already taken")) {
        return res.status(httpStatus.BAD_REQUEST).send({
          status: httpStatus.BAD_REQUEST,
          data: { phone: "Phone already taken!" },
        });
      } else {
        console.log("Erorr", error);
        // next(new ApiError(error, httpStatus.INTERNAL_SERVER_ERROR));
        next(error);
      }
    }
  }

  async loginController(req, res, next) {
    const { body } = req;

    const password = passwordToHash(body.password).toString();

    try {
      const Marchant = await CustomerService.GetMarchantByMailAndPassword({
        email: body.email,
        password: password,
      });
      let refreshToken;
      if (!Marchant) {
        return next(
          new ApiError("Invalid Marchant Credentials!!", httpStatus.NOT_FOUND)
        );
      } else {
        // accessToken, refreshToken
        refreshToken = generateRefreshToken(Marchant);
        const result = {
          ...Marchant.toObject(),
          tokens: {
            accessToken: generateAccessToken(Marchant),
            refreshToken: refreshToken,
          },
        };
        delete result.password;
        delete result.refreshTokens;
        await CustomerService.UpdateMarchantProfile({
          id: Marchant.id,
          refreshToken: refreshToken,
        });
        return res.status(httpStatus.OK).send({
          status: "OK",
          data: result,
        });
      }
    } catch (error) {
      // return next(new ApiError(error?.message));
      console.log(error);
      next(error);
    }
  }

  

  async changePasswordController(req, res, next) {
    const { body, user } = req;
    const prevPassword = passwordToHash(body.prevPassword).toString();
    const password = passwordToHash(body.password).toString();
    try {
      const marchant = await CustomerService.GetMarchantByIdAndPassword({
        id: user.id,
        password: prevPassword,
      });

      if (!marchant) {
        return next(new ApiError("Wrong Password!", httpStatus.BADREQUEST));
      }
      const User = await CustomerService.update(
        { _id: user.id },
        { ...body, password: password }
      );
      if (!User) {
        return next(
          new ApiError(
            "Password Change Failed",
            httpStatus.INTERNAL_SERVER_ERROR
          )
        );
      } else {
        return res.status(httpStatus.OK).send({
          status: "OK",
          data: User,
        });
      }
    } catch (error) {
      // return next(new ApiError(error?.message));
      console.log(error);
      next(error);
    }
  }

  async newPasswordContoller(req, res, next) {
    const { body } = req;
    if (!body?.resetToken) {
      return next(
        new ApiError("No Reset Token Found! ", httpStatus.BAD_REQUEST)
      );
    }

    let decoded = jwt.verify(
      body.resetToken,
      process.env.PASSWORD_RESET_TOKEN,
      (err, decoded) => {
        if (err) {
          return res.status(httpStatus.FORBIDDEN).send({
            status: httpStatus.FORBIDDEN,
            data: { error: "Expired Or Invalid Resst Token !" },
          });
        } else {
          return decoded;
        }
      }
    );

    const password = passwordToHash(body.password).toString();

    try {
      const User = await CustomerService.update(
        { _id: decoded.id },
        { ...body, password: password }
      );
      if (!User) {
        return next(
          new ApiError(
            "Reset  Password Failed, No Marchant Found!",
            httpStatus.NOT_FOUND
          )
        );
      } else {
        return res.status(httpStatus.OK).send({
          status: "OK",
          data: User,
        });
      }
    } catch (error) {
      // return next(new ApiError(error?.message));
      console.log(error);
      next(error);
    }
  }

  async emailConfirmationContoller(req, res, next) {
    const { body } = req;
    if (!body?.confirmToken) {
      return next(
        new ApiError("No Confirm Token Found! ", httpStatus.BAD_REQUEST)
      );
    }
    let decoded = jwt.verify(
      body.confirmToken,
      process.env.SIGNUP_EMAIL_CONFIRMATION_TOKEN,
      (err, decoded) => {
        if (err) {
          return res.status(httpStatus.FORBIDDEN).send({
            status: "FAILED",
            data: { error: err?.message },
          });
        } else {
          return decoded;
        }
      }
    );

    try {
      const User = await CustomerService.update(
        { _id: decoded.id },
        { ...body, isEmailVerified: true }
      );
      if (!User) {
        return next(
          new ApiError(
            "Email Confirmation Failed, No Marchant Found!",
            httpStatus.UNAUTHORIZED
          )
        );
      } else {
        return res.status(httpStatus.OK).send({
          status: "OK",
          data: User,
        });
      }
    } catch (error) {
      // return next(new ApiError(error?.message));
      console.log(error);
      next(error);
    }
  }

  async resetPasswordContoller(req, res, next) {
    const { body } = req;

    try {
      const marchant = await CustomerService.getByEmail(body.email);

      if (!marchant) {
        return next(new ApiError("Marchant not found", httpStatus.NOT_FOUND));
      } else {
        const resetToken = generatePasswordResetToken(marchant);

        const templateData = {
          name: marchant.firstName,
          resetLink:
            process.env.FRONTEND_BASE_URL +
            `/marchant/resetPassword?resetToken=${resetToken}`,
        };
        // ! eventEmitter
        eventEmitter.emit("send_email", {
          to: marchant.email,
          subject: "ShopLover-Password Recovery",
          templateName: "resetPassword",
          templateData: templateData,
          hasTemplate: true,
        });
        return res.status(httpStatus.OK).send({
          status: "OK",
          data: { marchant, resetToken: resetToken }, //// resetToken Must be removed from this res.send,use for Postman Test purpose
        });
      }
    } catch (error) {
      // return next(new ApiError(error?.message));
      console.log(error);
      next(error);
    }
  }

  

  async refreshToken(req, res, next) {
    const { body } = req;
    const refreshToken = body.refreshToken;
    try {
      let doc;

      doc = await CustomerService.GetMarchant({ refeshTokens: refreshToken });

      if (!doc) {
        return res.status(httpStatus.BAD_REQUEST).send({
          status: httpStatus.FORBIDDEN,
          data: { error: "Invalid Or Expired Refresh Token!" },
        });
      }

      const { type, id } = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN,
        (err, decoded) => {
          if (err) {
            CustomerService.RemoveMarchantRefreshToken({
              refreshToken,
              id: doc._id,
            });
            return next(
              new ApiError(
                "Invalid Or Expired Refresh Token!",
                httpStatus.BAD_REQUEST
              )
            );
          } else {
            return decoded;
          }
        }
      );
      if (!type === "refresh") {
        return res.status(httpStatus.BAD_REQUEST).send({
          status: "FAILED",
          data: { error: "Invalid Token Type!" },
        });
      }

      // Generate a new access token
      const accessToken = generateAccessToken({ _id: id });
      return res.send({ accessToken });
    } catch (error) {
      console.log("error:", error);
      return next(
        new ApiError(
          "Invalid Or Expired Refresh Token!",
          httpStatus.BAD_REQUEST
        )
      );
    }
  }

  async logout(req, res, next) {
    const { body } = req;
    const refreshToken = body?.refreshToken;
    const isLogOutFromAllDevice = body?.logoutFromAllDevice;
    try {
      let doc;
      doc = await CustomerService.GetMarchant({ refeshTokens: refreshToken });
      if (refreshToken && isLogOutFromAllDevice) {
        doc = await CustomerService.RemoveMarchantRefreshToken({
          refreshToken: null,
          id: doc_id,
        });
      } else if (refreshToken) {
        doc = await CustomerService.RemoveMarchantRefreshToken({
          refreshToken,
          id: doc._id,
        });
      }

      return res.status(httpStatus.OK).send({
        status: "OK",
        data: { Msg: "Logout Success!" },
      });
    } catch (error) {
      console.log("error:", error);
      return new ApiError("Problem with logout!", httpStatus.BAD_REQUEST);
    }
  }

  // async profileController(req, res, next) {
  //   const { user } = req;

  //   try {
  //     const marchants = await CustomerService.GetMarchantById(user.id);
  //     if (!marchants) {
  //       return next(new ApiError("No Marchant Found !!", httpStatus.NOT_FOUND));
  //     } else {
  //       res.status(httpStatus.OK).send({
  //         status: "OK",
  //         data: marchants,
  //       });
  //     }
  //   } catch (error) {
  //     // return next(new ApiError(error?.message));
  //     console.log(error);
  //     next(error);
  //   }
  // }

  // async updateMarchantGeneralController(req, res, next) {
  //   const { body } = req;
  //   let bodyData = { ...body };
  //   try {
  //     const MarchantInfo = await CustomerService.UpdateMarchantGeneralInfo({
  //       ...bodyData,
  //       user_id: req.user.id,
  //     });

  //     if (!MarchantInfo) {
  //       return next(
  //         new ApiError(
  //           "Marchant General Info Update Failed !",
  //           httpStatus.BAD_REQUEST
  //         )
  //       );
  //     } else {
  //       res.status(httpStatus.CREATED).send({
  //         status: "OK",
  //         data: { ...MarchantInfo.toObject() },
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }


  // async updateProfileImage(req, res, next) {
  //   const { body } = req;
  //   try {
  //     if (req?.file) {
  //       const profileImageFile = req.file;
  //       let profileImageSave = "";
  //       if (profileImageFile) {
  //         const profileImageBuffer = await resizeImage(
  //           profileImageFile.buffer,
  //           parseInt(process.env.MARCHANT_PROFILE_IMAGE_HEIGHT),
  //           parseInt(process.env.MARCHANT_PROFILE_IMAGE_WIDTH)
  //         );

  //         const convertedprofileImageBuffer = await convertImage(
  //           profileImageBuffer,
  //           process.env.MARCHANT_PROFILE_IMAGE_EXTENSION
  //         );
  //         profileImageSave = await saveToDisk(
  //           convertedprofileImageBuffer,
  //           "marchant/profile",
  //           "profile_" + uuidv4(),
  //           process.env.MARCHANT_PROFILE_IMAGE_EXTENSION
  //         );
  //       }
  //       body.profileImage = profileImageSave;
  //     } else {
  //       return next(new ApiError("No Image Found", httpStatus.NOT_FOUND));
  //     }

  //     const updateImageToDatabase =
  //       await CustomerService.UpdateMarchantProfilePicture({
  //         _id: req.user.id,
  //         profileImage: body.profileImage,
  //       });

  //     if (updateImageToDatabase) {
  //       return res.status(httpStatus.OK).send({
  //         status: "OK",
  //         data: updateImageToDatabase,
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }


  // async updateMarchantBusinessInfoController(req, res, next) {
  //   const { body, user } = req;

  //   try {
  //     if (req?.file) {
  //       const nidImageFile = req.file;
  //       let nidImageSave = "";
  //       if (nidImageFile) {
  //         const nidImageBuffer = await resizeImage(
  //           nidImageFile.buffer,
  //           parseInt(process.env.MARCHANT_NID_IMAGE_HEIGHT),
  //           parseInt(process.env.MARCHANT_NID_IMAGE_WIDTH)
  //         );

  //         const convertedNidImageBuffer = await convertImage(
  //           nidImageBuffer,
  //           process.env.MARCHANT_NID_IMAGE_EXTENSION
  //         );
  //         nidImageSave = await saveToDisk(
  //           convertedNidImageBuffer,
  //           "Marchant/NID",
  //           "NID_" + uuidv4(),
  //           process.env.MARCHANT_NID_IMAGE_EXTENSION
  //         );
  //       }
  //       body.nationalIdImage = nidImageSave;
  //     }

  //     if (body?.addressInfo) {
  //       body.addressInfo = JSON.parse(body.addressInfo);
  //     }
  //     let bodyData = { ...body };
  //     const MarchantInfo = await CustomerService.UpdateMarchantBusinessInfo({
  //       ...bodyData,
  //       user_id: user.id,
  //     });

  //     if (!MarchantInfo) {
  //       return next(
  //         new ApiError(
  //           "Marchant Business Info Update Failed !",
  //           httpStatus.BAD_REQUEST
  //         )
  //       );
  //     } else {
  //       res.status(httpStatus.CREATED).send({
  //         status: "OK",
  //         data: { ...MarchantInfo.toObject() },
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }
  // async getMarchantBusinessInfoController(req, res, next) {
  //   const { body, params } = req;

  //   try {
  //     const MarchantBusinessInfo =
  //       await CustomerService.GetMarchantBusinessInfo({
  //         marchant_Id: params.marchant_Id,
  //       });
  //     if (!MarchantBusinessInfo) {
  //       return next(
  //         new ApiError(
  //           "Marchant Business info not found !",
  //           httpStatus.NOT_FOUND
  //         )
  //       );
  //     } else {
  //       res.status(httpStatus.OK).send({
  //         status: "OK",
  //         data: { ...MarchantBusinessInfo.toJSON() },
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }

  // async getMarchantInfoController(req, res, next) {
  //   const { body, params } = req;

  //   try {
  //     const MarchantInfo = await CustomerService.GetMarchantInfo({
  //       marchant_Id: params.marchant_Id,
  //     });
  //     if (!MarchantInfo) {
  //       return next(
  //         new ApiError("Marchant info not found !", httpStatus.NOT_FOUND)
  //       );
  //     } else {
  //       res.status(httpStatus.OK).send({
  //         status: "OK",
  //         data: { ...MarchantInfo.toJSON() },
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }

  // async getMarchantGeneralInfoController(req, res, next) {
  //   const { body, params } = req;

  //   try {
  //     const MarchantGeneralInfo = await CustomerService.GetMarchantGeneralInfo({
  //       marchant_Id: params.marchant_Id,
  //     });
  //     if (!MarchantGeneralInfo) {
  //       return next(
  //         new ApiError(
  //           "Marchant Address info not found !",
  //           httpStatus.NOT_FOUND
  //         )
  //       );
  //     } else {
  //       res.status(httpStatus.OK).send({
  //         status: "OK",
  //         data: { ...MarchantGeneralInfo.toJSON() },
  //       });
  //     }
  //   } catch (error) {
  //     return next(
  //       new ApiError(error?.message, httpStatus.INTERNAL_SERVER_ERROR)
  //     );
  //   }
  // }
  // async updateMarchantGeneralInfoController(req, res, next) {
  //   const { body, user } = req;

  //   try {
  //     const MarchantInfo = await CustomerService.UpdateMarchantGeneralInfo({
  //       ...body,
  //       user_id: user.id,
  //     });

  //     if (!MarchantInfo) {
  //       return next(
  //         new ApiError(
  //           "Marchant Address Info Update Failed !",
  //           httpStatus.BAD_REQUEST
  //         )
  //       );
  //     } else {
  //       res.status(httpStatus.CREATED).send({
  //         status: "OK",
  //         data: { ...MarchantInfo.toObject() },
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }

  // async getMarchantBankInfoController(req, res, next) {
  //   const { body, params } = req;

  //   try {
  //     const MarchantGeneralInfo = await CustomerService.GetMarchantBankInfo({
  //       marchant_Id: params.marchant_Id,
  //     });
  //     if (!MarchantGeneralInfo) {
  //       return next(
  //         new ApiError(
  //           "Marchant General info not found !",
  //           httpStatus.NOT_FOUND
  //         )
  //       );
  //     } else {
  //       res.status(httpStatus.OK).send({
  //         status: "OK",
  //         data: { ...MarchantGeneralInfo.toJSON() },
  //       });
  //     }
  //   } catch (error) {}
  // }
  // async updateMarchantBankInfoController(req, res, next) {
  //   const { body, user } = req;

  //   try {
  //     const MarchantInfo = await CustomerService.UpdateMarchantBankInfo({
  //       ...body,
  //       user_id: user.id,
  //     });
  //     if (!MarchantInfo) {
  //       return next(
  //         new ApiError(
  //           "Marchant Info Update Failed !",
  //           httpStatus.INTERNAL_SERVER_ERROR
  //         )
  //       );
  //     } else {
  //       res.status(httpStatus.CREATED).send({
  //         status: "OK",
  //         data: { ...MarchantInfo.toObject() },
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }

  // async getMarchantBusinessInfoController(req, res, next) {
  //   const { body, params } = req;

  //   try {
  //     const MarchantGeneralInfo = await CustomerService.GetMarchantBusinessInfo(
  //       {
  //         marchant_Id: params.marchant_Id,
  //       }
  //     );
  //     if (!MarchantGeneralInfo) {
  //       return next(
  //         new ApiError(
  //           "Marchant General info not found !",
  //           httpStatus.NOT_FOUND
  //         )
  //       );
  //     } else {
  //       res.status(httpStatus.OK).send({
  //         status: "OK",
  //         data: { ...MarchantGeneralInfo.toJSON() },
  //       });
  //     }
  //   } catch (error) {
  //     return next(
  //       new ApiError(error?.message, httpStatus.INTERNAL_SERVER_ERROR)
  //     );
  //   }
  // }
  // async updateMarchantBusniessInfoController(req, res, next) {
  //   const { body, params } = req;
  //   let bodyData = { ...body };
  //   if (!mongoIdChecker(bodyData?.marchant_Id)) {
  //     return next(
  //       new ApiError("Invalid Marchant ID !", httpStatus.BAD_REQUEST)
  //     );
  //   }
  //   try {
  //     const MarchantInfo = await CustomerService.UpdateMarchantBusinessInfo(
  //       bodyData
  //     );

  //     if (!MarchantInfo) {
  //       return next(
  //         new ApiError("Marchant Info Create Failed !", httpStatus.BAD_REQUEST)
  //       );
  //     } else {
  //       res.status(httpStatus.CREATED).send({
  //         status: "OK",
  //         data: { ...MarchantInfo.toObject() },
  //       });
  //     }
  //   } catch (error) {
  //     return next(
  //       new ApiError(error?.message, httpStatus.INTERNAL_SERVER_ERROR)
  //     );
  //   }
  // }

  // async getMarchantRtnAddressInfoController(req, res, next) {
  //   const { body, params } = req;

  //   try {
  //     const MarchantGeneralInfo =
  //       await CustomerService.GetMarchantRtnAddressInfo({
  //         marchant_Id: params.marchant_Id,
  //       });
  //     if (!MarchantGeneralInfo) {
  //       return next(
  //         new ApiError(
  //           "Marchant Return Address info not found !",
  //           httpStatus.NOT_FOUND
  //         )
  //       );
  //     } else {
  //       res.status(httpStatus.OK).send({
  //         status: "OK",
  //         data: { ...MarchantGeneralInfo.toJSON() },
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }
  // async updateMarchantRtnAddressInfoController(req, res, next) {
  //   const { body, user } = req;

  //   try {
  //     const MarchantInfo = await CustomerService.UpdateMarchantRtnAddressInfo({
  //       ...body,
  //       user_id: user.id,
  //     });

  //     if (!MarchantInfo) {
  //       return next(
  //         new ApiError(
  //           "Marchant Return Address Info Create Failed !",
  //           httpStatus.INTERNAL_SERVER_ERROR
  //         )
  //       );
  //     } else {
  //       res.status(httpStatus.CREATED).send({
  //         status: "OK",
  //         data: { ...MarchantInfo.toObject() },
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }
}
module.exports = new Customer();





// const { v4: uuidv4 } = require("uuid");
// // const eventEmitter = require("../scripts/events/eventEmitter");
// const path = require("path");
// const httpStatus = require("http-status");
// const passwordToHash = require("../utils/helper.utils");
// const {
//   generateAccessToken,
//   generateRefreshToken,
// } = require("../utils/jwt.utils");
// const UserService = require("../services/user.service");
// const ApiError = require("../errors/ErrorHandler");
// const { createLogger } = require("winston");
// const { AppError } = require("../utils/appError.utils");

// class User {
//   async createController(req, res, next) {
//     const { body } = req;

//     /// Email Or Phone Validations
//     if ((!body.email || body.phone) && (body.email || !body.phone)) {
//       return next(
//         new ApiError("Email or Phone is required", httpStatus.BAD_REQUEST)
//       );
//     }
//     const password = passwordToHash(body.password);
//     try {
//       const User = await UserService.CreateUser({ ...body, password });

//       if (!User) {
//         return next(
//           new ApiError("User Create Failed !", httpStatus.BAD_REQUEST)
//         );
//       } else {
//         res.status(httpStatus.CREATED).send({
//           status: "OK",
//           data: User,
//         });
//       }
//     } catch (error) {
//       return next(new ApiError(error?.message));
//     }
//   }

//   async loginController(req, res, next) {
//     const { body } = req;

//     const password = passwordToHash(body.password).toString();

//     try {
//       const User = await UserService.GetUserByMailAndPassword({
//         email: body.email,
//         password: password,
//       });

//       if (!User) {
//         return next(new ApiError("No User found!!", httpStatus.NOT_FOUND));
//       } else {
//         // accessToken, refreshToken
//         const result = {
//           ...User.toObject(),
//           tokens: {
//             access_token: generateAccessToken(User),
//             refresh_token: generateRefreshToken(User),
//           },
//         };
//         delete result.password;
//         res.status(httpStatus.OK).send({
//           status: "OK",
//           data: result,
//         });
//       }
//     } catch (error) {
//       console.log(error);
//       return next(new ApiError(error?.message));
//     }
//   }

//   async profileController(req, res, next) {
//     const { user } = req;
//     try {
//       const users = await UserService.GetUserById(user.id);
//       if (!users) {
//         return next(new ApiError("No User Found !!", httpStatus.NOT_FOUND));
//       } else {
//         res.status(httpStatus.OK).send({
//           status: "OK",
//           data: users,
//         });
//       }
//     } catch (error) {
//       return next(new ApiError(error?.message));
//     }
//   }
// }
// module.exports = new User();
