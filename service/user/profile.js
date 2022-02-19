const userModel = require("../../model/user.model");
const paymentModel = require("../../model/payment.model");
const imagefile = require("./image");
const commonFile = require("../common");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { notification } = require("../../helper/notification");

function imagechange(userId, imgData) {
  return new Promise(async (res, rej) => {
    try {
      let updateUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: imgData },
        { new: true }
      );
      if (updateUser) res(updateUser);
    } catch (err) {
      console.log("errr....", err);
      rej(err);
    }
  });
}

module.exports = {
  get: (_id) => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await userModel.findById(
          { _id },
          {
            firstName: 1,
            lastName: 1,
            email: 1,
            mobile: 1,
            address: 1,
            profileImage: "$profileImage.url",
            bio: 1,
          }
        );
        if (getData) {
          res({ status: 200, data: getData });
        } else {
          rej({ status: 404, message: "Invalid user id!!" });
        }
        // res(getData)
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  update: (_id, data) => {
    return new Promise(async (res, rej) => {
      try {
        let updateData = await userModel.findByIdAndUpdate(_id, data);
        if (updateData) {
          // console.log(data)
          let notify = await notification(
            updateData._id,
            "Your profile data updated successfully!!",
            "Your data updated seccesssfully!!",
            "user"
          );
          res({ status: 200, data: "Profile Data Updated!!" });
        } else {
          rej({ status: 500, message: "something went wrong!!" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  resetPassword: (_id, oldPassword, newPassword) => {
    return new Promise(async (res, rej) => {
      try {
        let user = await userModel.findById({ _id }, { password: 1 });
        user = user.password;
        let ismatch = await bcrypt.compare(oldPassword, user);
        if (ismatch) {
          newPassword = await bcrypt.hash(newPassword, 12);
          let updatePassword = await userModel.findOneAndUpdate(
            { _id },
            { password: newPassword },
            { new: true }
          );
          res({ status: 200, data: "password updated successfully!!" });
        } else {
          rej({
            status: 404,
            error: {},
            message: "old password did not match!!",
          });
        }
      } catch (err) {
        console.log("err", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  //change profile image of a user
  image: (userid, image) => {
    return new Promise(async (res, rej) => {
      try {
        let imageUplaod = await commonFile.upload(image);
        let oldImg = await imagefile.get(userid);
        oldImg = oldImg.data;
        let imgChange = await imagechange(userid, {
          profileImage: {
            name: imageUplaod.data.name,
            url: imageUplaod.data.mediaLink,
          },
        });
        if (JSON.stringify(oldImg) !== JSON.stringify({})) {
          let deletedImg = await commonFile.delete(oldImg.profileImage.name);
        }
        res({ status: 200, data: "profile image changed successfully!!" });
      } catch (err) {
        console.log("err", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  resetProofImage: (data) => {
    return new Promise(async (res, rej) => {
      try {
        let updateData = await userModel.findOneAndUpdate(
          { email: data.email, password: data.password, mobile: data.mobile },
          {
            aadharCardFrontImg: data.aadharCardFrontImg,
            aadharCardBackImg: data.aadharCardBackImg,
            panCardImg: data.panCardImg,
            gstImg: data.gstImg,
            gstNo: data.gstNo,
            verifiedStatus: "pending",
          },
          { new: true }
        );
        if (updateData) {
          res({ status: 200, data: {} });
        } else {
          rej({ status: 500, message: "something went wrong!!11" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!22" });
      }
    });
  },

  //wallet of user
  wallet: (userId, page, limit, transactionType) => {
    return new Promise(async (res, rej) => {
      try {
        console.log("userId..........", userId);
        page = parseInt(page);
        limit = parseInt(limit);
        let qry = { userId: mongoose.Types.ObjectId(userId) };
        let project = {};
        if (transactionType && transactionType !== "all") {
          qry["transactionType"] = transactionType;
          if (transactionType == "credit") {
            project = {
              _id: 1,
              transactionAmount: 1,
              paymentDate: 1,
              transactionType: 1,
              paymentStatus: 1,
              orderId: 1,
              message: 1,
            };
          } else {
            project = {
              _id: 1,
              transactionAmount: 1,
              paymentDate: 1,
              transactionType: 1,
              orderId: 1,
              message: 1,
              serviceName: { $first: "$ServicePaymentData.name" },
            };
          }
        } else {
          project = {
            _id: 1,
            serviceName: { $first: "$ServicePaymentData.name" },
            transactionAmount: 1,
            transactionType: 1,
            paymentDate: 1,
            orderTrackingStatus: 1,
            message: 1,
            orderId: 1,
            paymentStatus: 1,
          };
        }
        let user = await userModel.findById(userId);
        let getData = await paymentModel.aggregate([
          {
            $match: qry,
          },
          {
            $lookup: {
              from: "orders",
              localField: "userId",
              foreignField: "userId",
              as: "PaymentOrderData",
            },
          },
          {
            $lookup: {
              from: "courierservices",
              localField: "PaymentOrderData.courierServiceId",
              foreignField: "_id",
              as: "ServicePaymentData",
            },
          },
          // { $unwind: '$ServicePaymentData' },
          {
            $facet: {
              total_count: [
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              result: [
                {
                  $project: project,
                },
                { $sort: { paymentDate: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
              ],
            },
          },
        ]);
        getData = getData[0];
        if (getData.result.length > 0) {
          res({
            status: 200,
            data: {
              wallet_amount: user.credit,
              total_count: getData.total_count[0].count,
              result: getData.result,
            },
          });
        } else {
          rej({ status: 404, message: "Invalid user id!!" });
        }
        // res(getData)
      } catch (err) {
        console.log("err", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },
};
