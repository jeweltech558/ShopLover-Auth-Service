const httpStatus = require("http-status");
const { createLogger } = require("winston");
const ApiError = require("../errors/ErrorHandler");
const {customerSchema,} = require("../models/customer.model");
const customerRepository = require("../repository/customer.repository");

class customerService extends customerRepository {
  constructor() {
    super(customerSchema);
  }
  async createCustomer(customer) {
    const prevCustomer = await Promise.all([
      this.getByEmail(
        customer.email === undefined || customer.email === null
          ? 0
          : customer.email
      ),
      this.getByPhone(
        customer.phone === undefined || customer.phone === null
          ? 0
          : customer.phone
      ),
    ]);

    

    if (prevCustomer[0]) {
      return Promise.reject({ message: "Email already taken!" });
    } else if (prevCustomer[1]) {
      return Promise.reject({ message: "Phone already taken!" });
    } else {
      const createdCustomer = await this.CreateCustomer(customer);

      return Promise.resolve(createdCustomer);
    }
  }

  GetCustomerByMailAndPassword(data) {
    try {
      const customer = this.getByMailAndPassword({
        email: data.email,
        password: data.password,
      });

      if (customer) {
        return customer;
      }
    } catch (err) {
      console.log("Error: ", err);
      throw new Error(err.message);
    }
  }

  // GetMarchantById(id) {
  //   try {
  //     const marchant = this.getById(id);

  //     if (marchant) {
  //       return marchant;
  //     }
  //   } catch (err) {
  //     console.log("marchant get Error: ", err);
  //     throw new Error(err.message);
  //   }
  // }

  GetCustomerByIdAndPassword(data) {
    try {
      const customer = this.getByIdAndPassword(data);

      if (customer) {
        return customer;
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }


  UpdateCustomerProfile(data) {
    try {
      const customer = this.updateCustomer({ id: data.id }, data);

      if (!customer) {
        return new ApiError("Customer Profile Update Failed!");
      }
      return customer;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  GetCustomer(where) {
    try {
      const marchant = this.listOne(where);
      if (marchant) {
        return marchant;
      }
    } catch (err) {
      console.log("Error: ", err);
      throw new Error(err.message);
    }
  }
  RemoveCustomerRefreshToken(data) {
    try {
      const customer = this.removeCustomerRefreshToken({ id: data.id }, data);
      if (customer) {
        return customer;
      }
    } catch (err) {
      console.log("Error: ", err);
      throw new Error(err.message);
    }
  }

  // GetMarchantByEmail(email) {
  //   try {
  //     const marchant = this.getByEmail(email);

  //     if (marchant) {
  //       return marchant;
  //     }
  //   } catch (err) {
  //     console.log("marchant get Error: ", err);
  //     throw new Error(err.message);
  //   }
  // }

  // async UpdateMarchantProfilePicture(data) {
  //   try {
  //     const marchant = await this.updateProfileImage(data);

  //     if (!marchant) {
  //       return new ApiError(
  //         "Image Upload Success But Save in database Failed!"
  //       );
  //     }
  //     return marchant;
  //   } catch (err) {
  //     throw new Error(err.message);
  //   }
  // }

  async UpdateCustomerGeneralInfoController(customerInfo) {
    console.log("Customer Info::>>> ", customerInfo);
    try {
      const updatedCustomerInfo = this.updateCustomerGeneralInfoRepository(
        { _id: customerInfo.user_id },
        customerInfo
      );
      if (!updatedCustomerInfo) {
        return new ApiError("Customer Info Update Failed!");
      }
      return updatedCustomerInfo;
    } catch (error) {
      console.log("Customer get Error: ", error);
      throw new Error(error.message);
    }
  }
  // async GetMarchantInfo(where) {
  //   try {
  //     const marchant = this.getMarchantInfo(where);
  //     if (marchant) {
  //       return marchant;
  //     }
  //   } catch (err) {
  //     console.log("Error: ", err);
  //     throw new Error(err.message);
  //   }
  // }

  // async GetMarchantGeneralInfo(where) {
  //   try {
  //     const marchant = this.getMarchantGeneralInfo(where);
  //     if (marchant) {
  //       return marchant;
  //     }
  //   } catch (err) {
  //     console.log("Error: ", err);
  //     throw new Error(err.message);
  //   }
  // }

  // async GetMarchantBusinessInfo(where) {
  //   try {
  //     const marchant = this.getMarchantBusinessInfo(where);
  //     if (marchant) {
  //       return marchant;
  //     }
  //   } catch (err) {
  //     console.log("Error: ", err);
  //     throw new Error(err.message);
  //   }
  // }
  // async UpdateMarchantBusinessInfo(marchantInfo) {
  //   try {
  //     const updatedMarchantInfo = this.updateMarchantBusinessInfo(
  //       { marchant: marchantInfo.user_id },
  //       marchantInfo
  //     );
  //     if (!updatedMarchantInfo) {
  //       return new ApiError("Marchant Business Info Update Failed!");
  //     }
  //     return updatedMarchantInfo;
  //   } catch (error) {
  //     console.log("marchant get Error: ", error);
  //     throw new Error(error.message);
  //   }
  // }

  // // async UpdateMarchantGeneralInfo(marchantInfo) {
  // //   try {
  // //     const updatedMarchantInfo = this.updateMarchantGeneralInfo(
  // //       { marchant_Id: marchantInfo.marchant_Id },
  // //       marchantInfo
  // //     );
  // //     if (!updatedMarchantInfo) {
  // //       return new ApiError("Marchant Business Info Update Failed!");
  // //     }
  // //     return updatedMarchantInfo;
  // //   } catch (error) {
  // //     console.log("marchant get Error: ", error);
  // //     throw new Error(error.message);
  // //   }
  // // }

  // async GetMarchantBankInfo(where) {
  //   try {
  //     const marchant = this.getMarchantBankInfo(where);
  //     if (marchant) {
  //       return marchant;
  //     }
  //   } catch (err) {
  //     console.log("Error: ", err);
  //     throw new Error(err.message);
  //   }
  // }
  // async UpdateMarchantBankInfo(marchantInfo) {
  //   try {
  //     const updatedMarchantInfo = this.updateMarchantBankInfo(
  //       { marchant: marchantInfo.user_id },
  //       marchantInfo
  //     );
  //     if (!updatedMarchantInfo) {
  //       return new ApiError("Marchant Bank Info Update Failed!");
  //     }
  //     return updatedMarchantInfo;
  //   } catch (error) {
  //     throw new Error(error.message);
  //   }
  // }

  // async GetMarchantRtnAddressInfo(where) {
  //   try {
  //     const marchant = this.getMarchantRtnAddressInfo(where);
  //     if (marchant) {
  //       return marchant;
  //     }
  //   } catch (err) {
  //     console.log("Error: ", err);
  //     throw new Error(err.message);
  //   }
  // }
  // async UpdateMarchantRtnAddressInfo(marchantInfo) {
  //   try {
  //     const updatedMarchantInfo = this.updateMarchantRtnAddressInfo(
  //       { marchant: marchantInfo.user_id },
  //       marchantInfo
  //     );
  //     if (!updatedMarchantInfo) {
  //       return new ApiError("Marchant Info Update Failed!");
  //     }
  //     return updatedMarchantInfo;
  //   } catch (error) {
  //     console.log("marchant get Error: ", error);
  //     throw new Error(error.message);
  //   }
  // }
}

module.exports = new customerService();
