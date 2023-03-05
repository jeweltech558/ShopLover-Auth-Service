const httpStatus = require("http-status");
const { createLogger } = require("winston");
const ApiError = require("../errors/ErrorHandler");
const {
  customerSchema,
} = require("../models/customer.model");
const customerRepository = require("../repository/customer.repository");

class customerService extends customerRepository {
  constructor() {
    super(customerSchema);
  }
  async CreateCustomer(customer) {
    const prevMarchant = await Promise.all([
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

    if (prevMarchant[0]) {
      return Promise.reject({ message: "Email already taken!" });
    } else if (prevMarchant[1]) {
      return Promise.reject({ message: "Phone already taken!" });
    } else {
      const createdCustomer = await this.CreateCustomer(customer);

      // if (createdCustomer) {
      //   await this.CreateCustomerInfo(createdCustomer);
      // }
      return Promise.resolve(createdCustomer);
    }
  }

  GetMarchantByMailAndPassword(data) {
    try {
      const marchant = this.getByMailAndPassword({
        email: data.email,
        password: data.password,
      });

      if (marchant) {
        return marchant;
      }
    } catch (err) {
      console.log("Error: ", err);
      throw new Error(err.message);
    }
  }

  GetMarchantById(id) {
    try {
      const marchant = this.getById(id);

      if (marchant) {
        return marchant;
      }
    } catch (err) {
      console.log("marchant get Error: ", err);
      throw new Error(err.message);
    }
  }
  GetMarchantByIdAndPassword(data) {
    try {
      const marchant = this.getByIdAndPassword(data);

      if (marchant) {
        return marchant;
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }

  GetMarchantByEmail(email) {
    try {
      const marchant = this.getByEmail(email);

      if (marchant) {
        return marchant;
      }
    } catch (err) {
      console.log("marchant get Error: ", err);
      throw new Error(err.message);
    }
  }

  async UpdateMarchantProfilePicture(data) {
    try {
      const marchant = await this.updateProfileImage(data);

      if (!marchant) {
        return new ApiError(
          "Image Upload Success But Save in database Failed!"
        );
      }
      return marchant;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  UpdateMarchantProfile(data) {
    try {
      const marchant = this.updateMarchant({ id: data.id }, data);

      if (!marchant) {
        return new ApiError("Marchant Profile Update Failed!");
      }
      return marchant;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  GetMarchant(where) {
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
  RemoveMarchantRefreshToken(data) {
    try {
      const marchant = this.removeMarchantRefreshToken({ id: data.id }, data);
      if (marchant) {
        return marchant;
      }
    } catch (err) {
      console.log("Error: ", err);
      throw new Error(err.message);
    }
  }

  async UpdateMarchantGeneralInfo(marchantInfo) {
    console.log("Marcahnt Info::>>> ", marchantInfo);
    try {
      const updatedMarchantInfo = this.updateMarchantGeneralInfo(
        { _id: marchantInfo.user_id },
        marchantInfo
      );
      if (!updatedMarchantInfo) {
        return new ApiError("Marchant Info Update Failed!");
      }
      return updatedMarchantInfo;
    } catch (error) {
      console.log("marchant get Error: ", error);
      throw new Error(error.message);
    }
  }
  async GetMarchantInfo(where) {
    try {
      const marchant = this.getMarchantInfo(where);
      if (marchant) {
        return marchant;
      }
    } catch (err) {
      console.log("Error: ", err);
      throw new Error(err.message);
    }
  }

  async GetMarchantGeneralInfo(where) {
    try {
      const marchant = this.getMarchantGeneralInfo(where);
      if (marchant) {
        return marchant;
      }
    } catch (err) {
      console.log("Error: ", err);
      throw new Error(err.message);
    }
  }

  async GetMarchantBusinessInfo(where) {
    try {
      const marchant = this.getMarchantBusinessInfo(where);
      if (marchant) {
        return marchant;
      }
    } catch (err) {
      console.log("Error: ", err);
      throw new Error(err.message);
    }
  }
  async UpdateMarchantBusinessInfo(marchantInfo) {
    try {
      const updatedMarchantInfo = this.updateMarchantBusinessInfo(
        { marchant: marchantInfo.user_id },
        marchantInfo
      );
      if (!updatedMarchantInfo) {
        return new ApiError("Marchant Business Info Update Failed!");
      }
      return updatedMarchantInfo;
    } catch (error) {
      console.log("marchant get Error: ", error);
      throw new Error(error.message);
    }
  }

  // async UpdateMarchantGeneralInfo(marchantInfo) {
  //   try {
  //     const updatedMarchantInfo = this.updateMarchantGeneralInfo(
  //       { marchant_Id: marchantInfo.marchant_Id },
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

  async GetMarchantBankInfo(where) {
    try {
      const marchant = this.getMarchantBankInfo(where);
      if (marchant) {
        return marchant;
      }
    } catch (err) {
      console.log("Error: ", err);
      throw new Error(err.message);
    }
  }
  async UpdateMarchantBankInfo(marchantInfo) {
    try {
      const updatedMarchantInfo = this.updateMarchantBankInfo(
        { marchant: marchantInfo.user_id },
        marchantInfo
      );
      if (!updatedMarchantInfo) {
        return new ApiError("Marchant Bank Info Update Failed!");
      }
      return updatedMarchantInfo;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async GetMarchantRtnAddressInfo(where) {
    try {
      const marchant = this.getMarchantRtnAddressInfo(where);
      if (marchant) {
        return marchant;
      }
    } catch (err) {
      console.log("Error: ", err);
      throw new Error(err.message);
    }
  }
  async UpdateMarchantRtnAddressInfo(marchantInfo) {
    try {
      const updatedMarchantInfo = this.updateMarchantRtnAddressInfo(
        { marchant: marchantInfo.user_id },
        marchantInfo
      );
      if (!updatedMarchantInfo) {
        return new ApiError("Marchant Info Update Failed!");
      }
      return updatedMarchantInfo;
    } catch (error) {
      console.log("marchant get Error: ", error);
      throw new Error(error.message);
    }
  }
}

module.exports = new customerService();
