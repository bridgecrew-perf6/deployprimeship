const countryModel = require("../../model/country.model");
const priceChartModel = require("../../model/pricechart.model");
const serviceModel = require("../../model/courierService.model");
const orderModel = require("../../model/order.model");
const orderHistoryModel = require("../../model/orderhistory.model");
const userModel = require("../../model/user.model");
const mongoose = require("mongoose");
const paymentModel = require("../../model/payment.model");
const { date, object } = require("joi");
const { create } = require("../../model/country.model");

module.exports = {
  getCountry: (str) => {
    return new Promise(async (res, rej) => {
      try {
        let qry = {};
        if (str) {
          qry["name"] = { $regex: str, $options: "i" };
        }
        let getData = await countryModel.find(qry, { name: 1, _id: 1 });
        if (getData.length > 0) res({ status: 200, data: getData });
        else rej({ status: 404, error: err, message: "No data found!!" });
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  get: (userId, str, status, startDate, endDate, page, limit) => {
    console.log("userId", userId);
    return new Promise(async (res, rej) => {
      try {
        page = parseInt(page);
        limit = parseInt(limit);
        let qry = {};
        if (str) {
          qry["$or"] = [
            { serviceName: { $regex: str, $options: "i" } },
            { orderTrackingStatus: { $regex: str, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: "$trackingNo" },
                  regex: str,
                },
              },
            },
          ];
        }
        if (status) {
          if (status == "all") {
            // do nothing
          } else {
            qry["orderTrackingStatus"] = status;
          }
        }
        if (startDate && endDate) {
          startDate = new Date(startDate);
          endDate = new Date(endDate);
          endDate.setDate(endDate.getDate() + 1);

          qry["$and"] = [
            { createdAt: { $gt: startDate } },
            { createdAt: { $lt: endDate } },
          ];
        }
        // console.log("qry..",qry)
        let getData = await orderModel.aggregate([
          {
            $match: {
              userId: mongoose.Types.ObjectId(userId),
            },
          },
          {
            $addFields: {
              date: {
                $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
              },
            },
          },
          {
            $lookup: {
              from: "payments",
              localField: "_id",
              foreignField: "orderId",
              as: "paymentOrderData",
            },
          },
          { $match: qry },
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
                  $project: {
                    _id: 1,
                    orderId: "$_id",
                    serviceName: 1,
                    orderTrackingStatus: 1,
                    trackingURL: 1,
                    courierId: 1,
                    amount: 1,
                    trackingNo: 1,
                    address: 1,
                    product: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    date: 1,
                    consignName: 1,
                    message: "$paymentOrderData.message",
                    extraCharge: 1,
                  },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
              ],
            },
          },
        ]);
        getData = getData[0];
        // console.log(getData)
        if (getData.result.length > 0) {
          let result = getData.result;
          let noTrack = [];
          let arr = [];
          for (let i = 0; i < result.length; i++) {
            if (!result[i].trackingNo) {
              noTrack.push(result[i]);
            } else {
              arr.push(result[i]);
            }
          }
          noTrack.push(...arr);
          res({
            status: 200,
            data: {
              total_count: getData.total_count[0].count,
              result: noTrack,
            },
          });
        } else {
          rej({ status: 404, message: "No Data found!!" });
        }
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  inVoice: (userId, page, limit, startDate, endDate) => {
    console.log("userId", userId);
    return new Promise(async (res, rej) => {
      page = parseInt(page);
      limit = parseInt(limit);
      let qry = {};
      if (startDate && endDate) {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        endDate.setDate(endDate.getDate() + 1);
        qry["$and"] = [
          { "orderData.createdAt": { $gt: startDate } },
          { "orderData.createdAt": { $lt: endDate } },
        ];
      }
      console.log("startDate..." + startDate + "endDate...." + endDate);
      console.log("qry.....", qry);
      try {
        let getData = await paymentModel.aggregate([
          {
            $match: { userId: mongoose.Types.ObjectId(userId) },
          },
          {
            $lookup: {
              from: "orders",
              localField: "orderId",
              foreignField: "_id",
              as: "orderData",
            },
          },
          { $unwind: "$orderData" },
          { $match: qry },
          {
            $lookup: {
              from: "courierservices",
              localField: "orderData.courierServiceId",
              foreignField: "_id",
              as: "serviceData",
            },
          },
          { $unwind: "$serviceData" },
          {
            $facet: {
              total_count: [
                {
                  $group: {
                    _id: null,
                    // amount: { $sum: "$transactionAmount" },
                    count: { $sum: 1 },
                  },
                },
              ],
              result: [
                {
                  $project: {
                    orderId: 1,
                    logo: "$serviceData.image",
                    // p2gRef:'$trackingNO',
                    postCode: "$orderData.address1.pincode",
                    item: "$orderData.product.content",
                    serviceName: "$orderData.serviceName",
                    courierServiceId: "$orderData.courierServiceId",
                    createdAt: "$orderData.createdAt",
                    // updatedAt: '$orderData.updatedAt',
                    paymentId: "$_id",
                    paymentDate: 1,
                    paymentStatus: 1,
                    orderTrackingStatus: 1,
                    trackingNO: "$orderData.trackingNo",
                    transactionAmount: 1,
                    transactionType: 1,
                  },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
              ],
            },
          },
        ]);
        if (getData) {
          getData = getData[0];
          if (getData.result.length > 0) {
            // let
            // for(let i=0;i<getData.result.length;i++){

            // }

            res({
              status: 200,
              data: {
                total_count: getData.total_count[0].count,
                result: getData.result,
                amount: getData.total_count[0].amount,
              },
            });
          } else rej({ status: 404, message: "No data found!!" });
        } else rej({ status: 404, message: "something went wrong!!" });
      } catch (err) {
        console.log("error", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  //   inVoice: (userId, page, limit, startDate, endDate) => {
  //     return new Promise(async (res, rej) => {
  //       try {
  //         let qry = { userId: mongoose.Types.ObjectId(userId) };
  //         page = parseInt(page);
  //         limit = parseInt(limit);

  //         if (startDate && endDate) {
  //           startDate = new Date(startDate);
  //           endDate = new Date(endDate);
  //           endDate.setDate(endDate.getDate() + 1);

  //           qry["$and"] = [
  //             { updatedAt: { $gt: startDate } },
  //             { updatedAt: { $lt: endDate } },
  //           ];
  //         }
  //         //get invoice
  //         let getData = await orderHistoryModel.find([
  //           {
  //             $match: qry,
  //           },
  //           {
  //             $lookup: {
  //               from: "order",
  //               localField: "",
  //               foreignField: "",
  //               as: "",
  //             },
  //           },
  //         ]);
  //       } catch (err) {}
  //     });
  //   },

  billObj: async (userId, startDate, endDate) => {
    console.log("userId billobj", userId);
    console.log("startDate billobj", startDate);
    console.log("endDate billobj", endDate);
    return new Promise(async (res, rej) => {
      try {
        let qry = {};
        if (startDate && endDate) {
          startDate = new Date(startDate);
          endDate = new Date(endDate);
          endDate.setDate(endDate.getDate() + 1);

          qry["$and"] = [
            { createdAt: { $gt: startDate } },
            { createdAt: { $lt: endDate } },
          ];
        }

        let getData = await orderHistoryModel.aggregate([
          {
            $match: { userId: mongoose.Types.ObjectId(userId) },
          },
          {
            $project: {
              orderTrackingStatus: 1,
              transactionAmount: 1,
              isRefund: 1,
              serviceCharge: 1,
              refund: 1,
              transactionType: 1,
              extraCharge: 1,
              createdAt: 1,
            },
          },
          { $match: qry },
        ]);
        if (getData.length > 0) {
          let cancelOrderCnt = 0;
          let completeOrderCnt = 0;
          let refundOrderCnt = 0;
          let refundOrderAmount = 0;
          let completeOrderAmount = 0;
          let cancelOrderAmount = 0;
          let totalOrderAmount = 0;
          let i;
          for (i = 0; i < getData.length; i++) {
            totalOrderAmount =
              totalOrderAmount +
              getData[i].transactionAmount +
              (getData[i].extraCharge || 0);

            if (getData[i].orderTrackingStatus == "parcelDispatch") {
              completeOrderCnt++;
              completeOrderAmount =
                completeOrderAmount +
                getData[i].transactionAmount +
                (getData[i].extraCharge || 0);
            }
            // order which is refunded
            else if (
              getData[i].orderTrackingStatus == "cancel" &&
              getData[i].transactionType == "refund"
            ) {
              refundOrderCnt++, cancelOrderCnt++;
              // add only refunded amount
              refundOrderAmount = refundOrderAmount + getData[i].refund;
              totalOrderAmount = totalOrderAmount - refundOrderAmount;
              // cancelOrderAmount =  extraCharge +transactionAmount(service + 4% if insurance)
              cancelOrderAmount =
                cancelOrderAmount +
                (getData[i].extraCharge || 0) +
                getData[i].transactionAmount;

              totalOrderAmount = totalOrderAmount - cancelOrderAmount;
            } else if (getData[i].orderTrackingStatus == "cancel") {
              cancelOrderCnt++;
              // cancelOrderAmount =  extraCharge +transactionAmount(service + 4% if insurance)
              cancelOrderAmount =
                cancelOrderAmount +
                (getData[i].extraCharge || 0) +
                getData[i].transactionAmount;

              totalOrderAmount = totalOrderAmount - cancelOrderAmount;
            }
          }
          if (i == getData.length) {
            res({
              status: 200,
              data: {
                cancelOrderCnt,
                cancelOrderAmount,
                completeOrderCnt,
                completeOrderAmount,
                refundOrderCnt,
                refundOrderAmount,
                totalOrderAmount,
              },
            });
          }
        } else {
          res({ status: 404, message: "No data found!" });
        }
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  trackOrder: (userId, trackingNo) => {
    return new Promise(async (res, rej) => {
      try {
        let url = await orderModel.findOne(
          { userId: userId, trackingNo: trackingNo },
          { trackingURL: 1 }
        );
        if (url) {
          url = url.trackingURL;
        } else {
          ej({
            status: 500,
            error: err,
            message: "tracking number is wrong!!",
          });
        }

        let pos = url.indexOf("{{traking_number}}", 0);

        // var a = "I want apple";
        // var b = " an";
        // var position = 6;
        // var output = [a.slice(0, position), b, a.slice(position)].join('');
        // console.log(output);

        let newUrl = url.slice(0, pos) + trackingNo;
        if (newUrl) {
          res({ status: 200, data: newUrl });
        }
      } catch (err) {
        console.log("error", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  orderCount: (userId) => {
    return new Promise(async (res, rej) => {
      try {
        console.log("userId........", userId);
        let getData = await orderModel.aggregate([
          {
            $match: {
              userId: mongoose.Types.ObjectId(userId),
            },
          },
          {
            $group: {
              _id: "$orderTrackingStatus",
              result: { $push: "$$ROOT" },
              count: { $sum: 1 },
            },
          },
        ]);
        if (getData) {
          let pendingCnt = 0;
          getData.map((item) => {
            if (item._id == "pending") {
              pendingCnt += item.count;
            }
          });
          res({ status: 200, data: { pendingCnt } });
        } else rej({ status: 500, message: "something went wrong!!" });
      } catch (err) {
        console.log("error", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },
};
