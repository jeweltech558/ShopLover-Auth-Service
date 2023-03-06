const DbRepository = require("./db.repository");
const {
  customerSchema,
} = require("../models/customer.model");
const { counter } = require("../services/counter.service");

class CustomerRepository extends DbRepository {
  constructor() {
    super(customerSchema);
  }
  CreateCustomer = async (customer) => {
    const autoId = await counter(
      customerSchema.modelName,
      process.env.MARCHANT_CODE_PREFIX
    );
    const id = autoId.sequence;

    return new Promise((resolve, reject) => {
      customerSchema
        .create({ ...customer, id })
        .then((customer) => resolve(customer))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  };

  getByEmail(email) {
    return new Promise((resolve, reject) => {
      customerSchema
        .find({ email: email })
        .then((customer) => resolve(customer[0]))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }
  getByPhone(phone) {
    return new Promise((resolve, reject) => {
      customerSchema
        .find({ phone: phone })
        .then((customer) => resolve(customer[0]))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  getByUsername(marchantname) {
    return new Promise((resolve, reject) => {
      customerSchema
        .findOne({ marchantname: marchantname })
        .then((marchant) => resolve(marchant))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  getByMailAndPassword(data) {
    return new Promise((resolve, reject) => {
      customerSchema
        .findOne({
          $and: [{ email: data.email }, { password: data.password }],
        })
        .then((customer) => resolve(customer))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  getById(id) {
    return new Promise((resolve, reject) => {
      customerSchema
        .findById(id)
        .then((customer) => resolve(customer))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }
  getByIdAndPassword(data) {
    return new Promise((resolve, reject) => {
      customerSchema
        .findOne({
          $and: [{ _id: data.id }, { password: data.password }],
        })
        .then((customer) => resolve(customer))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  updateProfileImage(data) {
    return new Promise((resolve, reject) => {
      customerSchema
        .findOneAndUpdate(
          { _id: data._id },
          { profileImage: data.profileImage },
          { new: true }
        )
        .then((customer) => resolve(customer))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  updateCustomer(where, data) {
    let update = {
      $set: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        isEmailVerified: data.isEmailVerified,
        isPhoneVerified: data.isPhoneVerified,
        passwordResetAt: data.passwordResetAt,
        statusId: data.statusId,
      },
      $push: {
        refreshTokens: data.refreshToken,
        // marchantInfo: data?.marchantInfo?._id,
      },
    };
    return new Promise((resolve, reject) => {
      customerSchema
        .findOneAndUpdate(where, update)
        .then((customer) => resolve(customer))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  removeCustomerRefreshToken(where, data) {
    let update;

    if (!where.refreshToken) {
      update = {
        $set: {
          refreshTokens: [],
        },
      };
    } else {
      update = {
        $pull: {
          refreshTokens: where.refreshToken,
        },
      };
    }
    return new Promise((resolve, reject) => {
      customerSchema
        .findOneAndUpdate({ _id: where.id }, update)
        .then((marchant) => resolve(marchant))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  // CreateCustomerInfo = async (marchantInfo) => {
  //   const autoId = await counter(marchantInfoSchema.modelName);
  //   const id = autoId.sequence;
  //   return new Promise((resolve, reject) => {
  //     marchantInfoSchema
  //       .create({
  //         marchant: marchantInfo._id,
  //         marchantId: marchantInfo.id,
  //         id,
  //       })
  //       .then((marchant) => resolve(marchant))
  //       .catch((error) => {
  //         console.log(error);
  //         reject(error);
  //       });
  //   });
  // };

  // updateMarchantBusinessInfo(where, data) {
  //   console.log(data);
  //   let update = {
  //     $set: {
  //       nationalId: data.nationalId,
  //       marchantTin: data.marchantTin,
  //       nationalIdImage: data.nationalIdImage,
  //       addressInfo: {
  //         country: data.addressInfo?.country,
  //         division: data.addressInfo?.division,
  //         city: data.addressInfo?.city,
  //         zip: data.addressInfo?.zip,
  //         address: data.addressInfo?.address,
  //       },
  //     },
  //   };
  //   return new Promise((resolve, reject) => {
  //     marchantInfoSchema
  //       .findOneAndUpdate(where, update, {
  //         new: true,
  //       })
  //       .select(" -bankInfo -returnAddress")
  //       .then((marchantInfo) => resolve(marchantInfo))
  //       .catch((error) => {
  //         reject(error);
  //       });
  //   });
  // }

  updateCustomerGeneralInfoRepository(where, data) {
    // let update = {
    //   $set: {
    //     firstName: data.firstName,
    //     lastName: data.lastName,
    //     phone: data.phone,
    //     shopName: data.shopName,
    //   },
    // };
    let update = {
      $set: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        addressInfo: {
          type: data.addressInfo?.type,
          country: data.addressInfo?.country,
          division: data.addressInfo?.division,
          district: data.addressInfo?.district,
          subDistrict: data.addressInfo?.subDistrict,
          area: data.addressInfo?.area,
          address: data.addressInfo?.address,
          isDefault: data.addressInfo?.isDefault,
        },
      },
    };
    return new Promise((resolve, reject) => {
      customerSchema
        .findOneAndUpdate(where, update, {
          new: true,
        })
        .select("-password -refreshTokens")
        .then((customerInfo) => resolve(customerInfo))
        .catch((error) => {
          reject(error);
        });
    });
  }

  // getMarchantInfo(where) {
  //   return new Promise((resolve, reject) => {
  //     marchantInfoSchema
  //       .findOne({ marchant: where.marchant_Id })
  //       .then((marchantInfo) => resolve(marchantInfo))
  //       .catch((error) => {
  //         console.log(error);
  //         reject(error);
  //       });
  //   });
  // }
  // getMarchantBusinessInfo(where) {
  //   return new Promise((resolve, reject) => {
  //     marchantInfoSchema
  //       .findOne({ marchant: where.marchant_Id })
  //       .select(" -bankInfo -returnAddress")
  //       .then((marchantInfo) => resolve(marchantInfo))
  //       .catch((error) => {
  //         console.log(error);
  //         reject(error);
  //       });
  //   });
  // }

  // getMarchantGeneralInfo(where) {
  //   return new Promise((resolve, reject) => {
  //     marchantInfoSchema
  //       .findOne({ marchant: where.marchant_Id })
  //       .select(
  //         "-nationalId -marchantTin -nationalIdImage -bankInfo -returnAddress"
  //       )
  //       .then((marchantInfo) => resolve(marchantInfo))
  //       .catch((error) => {
  //         console.log(error);
  //         reject(error);
  //       });
  //   });
  // }

  // updateMarchantGeneralInfo(where, data) {
  //   let update = {
  //     $set: {
  //       addressInfo: {
  //         country: data.country,
  //         division: data.division,
  //         city: data.city,
  //         zip: data.zip,
  //         address: data.address,
  //       },
  //     },
  //   };
  //   return new Promise((resolve, reject) => {
  //     marchantInfoSchema
  //       .findOneAndUpdate({ marchant: where.marchant_Id }, update, {
  //         new: true,
  //       })
  //       .select(
  //         "-nationalId -marchantTin -nationalIdImage -bankInfo -returnAddress"
  //       )
  //       .then((marchantInfo) => resolve(marchantInfo))
  //       .catch((error) => {
  //         console.log(error);
  //         reject(error);
  //       });
  //   });
  // }

  // getMarchantBankInfo(where) {
  //   return new Promise((resolve, reject) => {
  //     marchantInfoSchema
  //       .findOne({ marchant: where.marchant_Id })
  //       .select(
  //         "-nationalId -marchantTin -nationalIdImage -returnAddress -addressInfo"
  //       )
  //       .then((marchantInfo) => resolve(marchantInfo))
  //       .catch((error) => {
  //         console.log(error);
  //         reject(error);
  //       });
  //   });
  // }

  // updateMarchantBankInfo(where, data) {
  //   let update = {
  //     $set: {
  //       bankInfo: {
  //         accountNo: data.accountNo,
  //         routeNo: data.routeNo,
  //         branchName: data.branchName,
  //         bankName: data.bankName,
  //         accountTitle: data.accountTitle,
  //       },
  //     },
  //   };
  //   return new Promise((resolve, reject) => {
  //     marchantInfoSchema
  //       .findOneAndUpdate(where, update, {
  //         new: true,
  //       })
  //       .select(
  //         "-nationalId -marchantTin -nationalIdImage -returnAddress -addressInfo"
  //       )
  //       .then((marchantInfo) => resolve(marchantInfo))
  //       .catch((error) => {
  //         console.log(error);
  //         reject(error);
  //       });
  //   });
  // }

  // getMarchantRtnAddressInfo(where) {
  //   return new Promise((resolve, reject) => {
  //     marchantInfoSchema
  //       .findOne({ marchant: where.marchant_Id })
  //       .select(
  //         "-nationalId -marchantTin -nationalIdImage -addressInfo -bankInfo"
  //       )
  //       .then((marchantInfo) => resolve(marchantInfo))
  //       .catch((error) => {
  //         console.log(error);
  //         reject(error);
  //       });
  //   });
  // }

  // updateMarchantRtnAddressInfo(where, data) {
  //   let update = {
  //     $set: {
  //       returnAddress: {
  //         name: data.name,
  //         mobile: data.mobile,
  //         country: data.country,
  //         division: data.division,
  //         city: data.city,
  //         zip: data.zip,
  //         address: data.address,
  //       },
  //     },
  //   };
  //   return new Promise((resolve, reject) => {
  //     marchantInfoSchema
  //       .findOneAndUpdate(where, update, {
  //         new: true,
  //       })
  //       .select(
  //         "-nationalId -marchantTin -nationalIdImage -addressInfo -bankInfo"
  //       )
  //       .then((marchantInfo) => resolve(marchantInfo))
  //       .catch((error) => {
  //         console.log(error);
  //         reject(error);
  //       });
  //   });
  // }
}

module.exports = CustomerRepository;
