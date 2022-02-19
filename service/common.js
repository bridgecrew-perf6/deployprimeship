const countryModel = require("../model/country.model");
const mongoose = require("mongoose");
const priceChartModel = require("../model/pricechart.model");
const userModel = require("../model/user.model");
const orderModel = require("../model/order.model");
const aboutUsModel = require("../model/about_us.model");
const paymentModel = require("../model/payment.model");
const notificationModel = require("../model/notification.model");
const orderHistoryModel = require("../model/orderhistory.model");

const { notification } = require("../helper/notification");
const middleUpload = require("../middleware/imageupload");
const multer = require("multer");
const { initializeApp, cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");
const serviceAccount = require("../helper/firebase.json");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

//firebase configuration
initializeApp({
  credential: cert(serviceAccount),
});
const bucket = getStorage().bucket(
  "gs://image-upload-nodejs-f3674.appspot.com"
);

module.exports = {
  addToOrderHistory(
    userId,
    userName,
    paymentId,
    paymentDate,
    paymentStatus,
    orderId,
    status,
    trackingNo,
    trackingURL,
    amount,
    transactionType,
    address,
    adminId,
    adminData,
    serviceName,
    courierServiceId,
    serviceCharge
  ) {
    let historyObj = {
      userId: userId,
      userName: userName,
      paymentId: paymentId,
      paymentDate: paymentDate,
      paymentStatus: paymentStatus,
      orderId: orderId,
      orderTrackingStatus: status,
      trackingNO: trackingNo,
      trackingURL: trackingURL,
      transactionAmount: amount,
      transactionType: transactionType,
      address: address,
      adminid: adminId,
      adminName: adminData,
      serviceName: serviceName,
      courierServiceId: courierServiceId,
      serviceCharge: serviceCharge,
    };
    let newHistoryModel = new orderHistoryModel(historyObj);
    newHistoryModel.save();
  },

  getCountryList: (str) => {
    return new Promise(async (res, rej) => {
      try {
        let qry = {};
        if (str) {
          qry["name"] = { $regex: str, $options: "i" };
        }
        let getData = await countryModel.find(qry, { name: 1, _id: 1 });
        if (getData.length > 0) res({ status: 200, data: getData });
        else rej({ status: 404, error: {}, message: "No data found!!" });
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  findService: (countryId, weight, length, width, height) => {
    return new Promise(async (res, rej) => {
      try {
        // logic for parcel gram
        let totalGram = ((length * width * height) / 5000) * 100;

        let z = totalGram / 100;
        let floorVal = Math.floor(z);

        if (Number.isInteger(z)) {
          floorVal = floorVal * 100;
        } else {
          floorVal = floorVal * 100 + 100;
        }
        console.log("floorVal", floorVal);
        let resp = await priceChartModel.aggregate([
          {
            $match: {
              countryId: mongoose.Types.ObjectId(countryId),
              parcelGram: floorVal,
            },
          },
          {
            $lookup: {
              from: "courierservices",
              localField: "serviceId",
              foreignField: "_id",
              as: "serviceData",
            },
          },
          { $unwind: "$serviceData" },
          {
            $project: {
              courierServiceId: "$serviceData._id",
              serviceName: "$serviceData.name",
              trackingURL: "$serviceData.trackingURL",
              image: "$serviceData.image",
              price: 1,
              weight: { $literal: weight },
              // weight,
              length: { $literal: length },
              width: { $literal: width },
              height: { $literal: height },
            },
          },
        ]);
        if (resp.length > 0) res({ status: 200, data: resp });
        else rej({ status: 404, error: {}, message: "No data found!!" });
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  placeOrder: (userId, data) => {
    console.log("userid..", userId);
    return new Promise(async (res, rej) => {
      try {
        //check if user has enoght credit or not
        let creditData = await userModel.findById(
          { _id: userId },
          { credit: 1, _id: 0, firstName: 1, lastName: 1 }
        );
        console.log("creditData", creditData);
        // let
        // creditData = creditData.credit

        if (creditData.credit >= data.amount) {
          data["userId"] = userId;
          data["userName"] = creditData.firstName + " " + creditData.lastName;

          if (data.insurance == true) {
            let a = (4 * data.product.itemValue) / 100;
            grandTotal = a + data.amount;
            data["grandTotal"] = grandTotal;
          } else {
            data["grandTotal"] = data.amount;
          }
          let newOrderModel = new orderModel(data);
          let savedata = await newOrderModel.save();

          // notification
          // if condition
          if (data.userId) {
            let notify = await notification(
              userId,
              "Your order placed successfully!!",
              "Your order placed successfully!!",
              "order"
            );
          }
          // console.log("savedata", savedata)
          if (savedata) {
            let updatedData = await userModel.findByIdAndUpdate(
              { _id: userId },
              { credit: creditData.credit - data.grandTotal },
              { new: true }
            );

            //add to record payment model
            let paymentObj = {
              userId: userId,
              paymentDate: new Date(),
              orderId: savedata._id,
              paymentStatus: "complete",
              orderTrackingStatus: "pending",
              transactionAmount: savedata.grandTotal,
              transactionType: "debit",
              adminId: userId,
            };

            let newPaymentData = new paymentModel(paymentObj);
            let savPaymentHis = await newPaymentData.save();

            // notification
            let notify = await notification(
              userId,
              "Amount debited successfully!!",
              "Amount debited successfully!!",
              "payment"
            );

            if (updatedData) {
              res({ status: 200, data: "order placed successfully!!" });
            } else
              rej({
                status: 500,
                error: {},
                message: "amount is not deducted from user account!!",
              });
          } else {
            rej({
              status: 500,
              error: {},
              message: "something went wrong!!11",
            });
          }
        } else {
          rej({
            status: 500,
            error: {},
            message: "You have not enough credit amount to place an order!!",
          });
        }
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: {}, message: "something went wrong!!22" });
      }
    });
  },

  //get order by id
  byId: (_id) => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await orderModel.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(_id) },
          },
          // {
          //     $lookup: {
          //         from: "courierservices",
          //         localField: "courierServiceId",
          //         foreignField: "_id",
          //         as: "courierOrderData"
          //     }
          // },
          // { "$unwind": "$courierOrderData" },
          {
            $project: {
              _id: 0,
              orderId: "$_id",
              serviceName: 1,
              orderTrackingStatus: 1,
              trackingURL: 1,
              courierId: 1,
              amount: 1,
              trackingNo: 1,
              address: 1,
              product: 1,
              consignName: 1,
              mobile: 1,
              insurance: 1,
              userId: 1,
              userName: 1,
              refund: 1,
              isRefund: 1,
              grandTotal: 1,
              extraCharge: 1,
              courierServiceId: 1,
            },
          },
        ]);
        if (getData) {
          res({ status: 200, data: getData[0] });
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

  getAboutUs: () => {
    return new Promise(async (res, rej) => {
      try {
        // console.log("data.....", data)
        let getData = await aboutUsModel.find({});
        if (getData) {
          res({ status: 200, data: getData });
        } else {
          rej({ status: 500, message: "something went wrong!!" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  upload: (image) => {
    return new Promise(async (res, rej) => {
      try {
        //firebase logic to upload the image

        let uploaded = bucket.upload(image.path, {
          public: true,
          destination: `images/${Math.random() * 10000 + image.filename}`,
          metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
          },
        });
        let data = await uploaded;
        if (data) {
          fs.unlinkSync(image.path);
          res({
            status: 200,
            data: {
              mediaLink: data[0].metadata.mediaLink,
              name: data[0].metadata.name,
            },
          });
        }
      } catch (err) {
        console.log("error..", err);
        rej({ status: 500, error: err });
      }
    });
  },

  delete: (image) => {
    return new Promise(async (res, rej) => {
      try {
        const deleted = await bucket.file(image).delete();
        if (deleted) {
          res({ status: 200, data: "image deleted Successfully !!" });
        } else {
          rej({ status: 500, error: err });
        }
      } catch (err) {
        console.log("err/...", err);
        rej({ status: 500, error: err });
      }
    });
  },
};
