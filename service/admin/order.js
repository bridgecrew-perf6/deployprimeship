const orderModel = require("../../model/order.model");
const paymentModel = require("../../model/payment.model");
const userModel = require("../../model/user.model");
const adminModel = require("../../model/admin.model");
const orderHistoryModel = require("../../model/orderhistory.model");
const notificationModel = require("../../model/notification.model");
const historymodel = require("../../model/orderhistory.model");
const refund = require("../user/refund");
const { addToOrderHistory } = require("../../service/common");
let { notification } = require("../../helper/notification");
const mongoose = require("mongoose");

module.exports = {
  addForwardingNo: (userId, orderId, trackingNo) => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await orderModel.findByIdAndUpdate(
          { _id: orderId },
          { trackingNo: trackingNo, orderTrackingStatus: "parcelDispatch" },
          { new: true }
        );

        let paymentData = await paymentModel.findOneAndUpdate(
          { orderId },
          { orderTrackingStatus: "parcelDispatch" },
          { new: true }
        );
        let adminData = await adminModel.findById(
          { _id: userId },
          { firstName: 1, lastName: 1 }
        );
        adminData = adminData.firstName + " " + adminData.lastName;
        // add to order history
        let hisData = await orderHistoryModel.findOne({ orderId: orderId });
        if (hisData) {
          await orderHistoryModel
            .findOneAndUpdate(
              { orderId: orderId },
              { trackingNo },
              { upsert: true }
            )
            .then((result) => {
              res({ status: 200, data: {} });
            })
            .catch((err) => {
              console.log("error....", err);
              rej({
                status: 500,
                error: err,
                message: "something went wrong!!",
              });
            });
        } else {
          addToOrderHistory(
            getData.userId,
            getData.userName,
            paymentData._id,
            paymentData.paymentDate,
            paymentData.paymentStatus,
            orderId,
            "parcelDispatch",
            trackingNo,
            getData.trackingURL,
            getData.grandTotal,
            paymentData.transactionType,
            getData.address,
            userId,
            adminData,
            getData.serviceName,
            getData.courierServiceId
          );
          //notification
          notification(
            getData.userId,
            `Your order is ready for dispatch and trackingNo is ${trackingNo}`,
            "parcelDispatch",
            "order",
            orderId
          )
            .then(() => {
              res({ status: 200, data: {} });
            })
            .catch((err) => {
              console.log("in catch error...", err);
              rej({ status: 500, error: err, message: "something went wrong" });
            });
        }
      } catch (err) {
        console.log("err...", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  get: (str, status, startDate, endDate, page, limit) => {
    return new Promise(async (res, rej) => {
      try {
        let qry = {};
        page = parseInt(page);
        limit = parseInt(limit);
        if (str) {
          qry["$or"] = [
            { "courierOrderData.name": { $regex: str, $options: "i" } },
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
        // console.log("qry..", qry)
        let getData = await orderModel.aggregate([
          {
            $addFields: {
              date: {
                $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
              },
            },
          },
          {
            $lookup: {
              from: "courierservices",
              localField: "courierServiceId",
              foreignField: "_id",
              as: "courierOrderData",
            },
          },
          {
            $lookup: {
              from: "payments",
              localField: "_id",
              foreignField: "orderId",
              as: "PaymentOrderData",
            },
          },
          { $unwind: "$courierOrderData" },
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
                    serviceName: "$courierOrderData.name",
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
                    refund: 1,
                    isRefund: 1,
                    grandTotal: 1,
                    message: "$PaymentOrderData.message",
                    extraCharge: 1,
                    insurance: 1,
                    // transactionAmount:
                    // {$cond:{if:{message:'$PaymentOrderData.message'},then:['$PaymentOrderData.transactionAmount'],else:"no extra payment"}},
                    // {$cond:{if:{message:'extra transportion charge'},then:['$PaymentOrderData.transactionAmount'],else:"no extra payment"}},
                    // {$cond:{if:{message:'$PaymentOrderData.message',},then:[transactionAmount='$PaymentOrderData.transactionAmount'],else:"no extra payment"}},
                    // transactionAmount:'$PaymentOrderData.transactionAmount'
                  },
                },
                // { $match: qry },
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

  // edit: (bodyData) => {
  edit: (userId, data) => {
    return new Promise(async (res, rej) => {
      try {
        let notify;
        let adminData = await adminModel.findById(userId);
        adminData = adminData.firstName + " " + adminData.lastName;

        //check orderId is valid or not
        let orderData = await orderModel.findById(data.orderId);

        if (orderData) {
          //check isRefund is true or false

          if (
            !(
              (!orderData.insurance &&
                orderData.orderTrackingStatus == "cancel") ||
              (orderData.insurance &&
                orderData.orderTrackingStatus == "cancel" &&
                orderData.isRefund)
            )
          ) {
            if (data.trackingNo) {
              console.log("tracking number is there");
              //tracking number is change
              if (
                orderData.trackingNo &&
                orderData.trackingNo !== data.trackingNo
              ) {
                console.log("tracking number is change");
                //reset the orderTrackingStatus and change the forwarding number
                let a1 = await orderModel.findByIdAndUpdate(
                  { _id: data.orderId },
                  {
                    orderTrackingStatus: "parcelDispatch",
                    trackingNo: data.trackingNo,
                  },
                  { new: true }
                );

                //update orderhistory
                let a10 = await orderHistoryModel.findOneAndUpdate(
                  { orderId: data.orderId },
                  { trackingNo: data.trackingNo },
                  { upsert: true }
                );

                //send notifiation to user as your tracking number is chnage: data.trackingNo
                notify = await notification(
                  data.userId,
                  `Your tracking number is change and new tracking number is ${data.trackingNo}`,
                  "tracking number change",
                  "order",
                  data.orderId
                );
              }
              //tracking number is add
              else {
                console.log("tracking number is add");
                let a2 = await orderModel.findByIdAndUpdate(
                  { _id: data.orderId },
                  {
                    orderTrackingStatus: "parcelDispatch",
                    trackingNo: data.trackingNo,
                  },
                  { new: true }
                );
                // console.log("a2...", a2)
                let paymentData = await paymentModel.findOneAndUpdate(
                  { orderId: data.orderId },
                  { orderTrackingStatus: "parcelDispatch" },
                  { new: true }
                );

                //add to orderHistory model if not added
                let hisData = await orderHistoryModel.findOne({
                  orderId: data.orderId,
                });
                if (!hisData) {
                  addToOrderHistory(
                    orderData.userId,
                    orderData.userName,
                    paymentData._id,
                    paymentData.paymentDate,
                    paymentData.paymentStatus,
                    data.orderId,
                    "parcelDispatch",
                    data.trackingNo,
                    orderData.trackingURL,
                    orderData.grandTotal,
                    paymentData.transactionType,
                    orderData.address,
                    userId,
                    adminData.firstName + " " + adminData.lastName,
                    orderData.serviceName
                  );
                }
                //send notification to user as your order is ready to dispatch and tracking number is : data.trackingNo
                if (
                  !(
                    orderData.trackingNo &&
                    orderData.trackingNo == data.trackingNo
                  )
                ) {
                  //send notification to user as your order is ready to dispatch and tracking
                  notify = await notification(
                    data.userId,
                    `Your order is ready to dispatch and tracking number is ${data.trackingNo}`,
                    "ready for dispatch",
                    "order",
                    data.orderId
                  );
                }
              }
            }

            //want to do cancel order with refund
            if (
              data.orderTrackingStatus === "cancel" &&
              data.refund &&
              orderData.insurance == true
            ) {
              if (orderData.product.itemValue < data.refund) {
                rej({
                  status: 404,
                  message: "Refund should not more than itemValue!!",
                });
              }
              //logic for cancel + refund
              else {
                console.log("cancel+refund");

                let a3 = await orderModel.findByIdAndUpdate(
                  { _id: data.orderId },
                  {
                    orderTrackingStatus: "cancel",
                    refund: data.refund,
                    isRefund: true,
                  },
                  { new: true }
                );

                //notification
                notify = await notification(
                  data.userId,
                  "Your order is cancel",
                  "cancel",
                  "order",
                  data.orderId
                );

                //add credit = credit+refund in user
                let a4 = await userModel.findByIdAndUpdate(
                  { _id: data.userId },
                  { $inc: { credit: data.refund } },
                  { new: true }
                );

                //add entry to payment model
                let paymentObj = {
                  userId: data.userId,
                  paymentDate: new Date(),
                  orderId: data.orderId,
                  paymentStatus: "complete",
                  orderTrackingStatus: data.orderTrackingStatus,
                  transactionAmount: data.refund,
                  transactionType: "refund",
                };
                let newPaymentData = new paymentModel(paymentObj);
                let savPaymentHis = await newPaymentData.save();

                //update orderHistoryModel
                let a5 = await orderHistoryModel.findOneAndUpdate(
                  { orderId: data.orderId },
                  {
                    orderTrackingStatus: "cancel",
                    refundDate: new Date(),
                    refund: data.refund,
                    isRefund: true,
                  },
                  { new: true }
                );
                if (!a5) {
                  addToOrderHistory(
                    data.userId,
                    data.userName,
                    savPaymentHis._id,
                    savPaymentHis.paymentDate,
                    savPaymentHis.paymentStatus,
                    data.orderId,
                    data.orderTrackingStatus,
                    data.trackingNo,
                    data.trackingURL,
                    data.grandTotal,
                    savPaymentHis.transactionType,
                    data.address,
                    userId,
                    adminData,
                    data.serviceName,
                    data.courierServiceId,
                    data.amount
                  );
                }
                //send notification of cancel order and refund
                notify = await notification(
                  data.userId,
                  `You got refund ${data.refund}`,
                  "refund",
                  "payment",
                  data.orderId
                );
              }
            }
            //logic for cancel + not refund
            else if (data.orderTrackingStatus == "cancel" && !data.refund) {
              //only cancel order not refund

              console.log("cancel+ not refund");

              let a6 = await orderModel.findByIdAndUpdate(
                { _id: data.orderId },
                { orderTrackingStatus: "cancel", refund: 0 },
                { new: true }
              );
              let serviceCharge = a6.amount + a6.extraCharge;

              // give service charge + extra chrages back to user credit
              let addCredit = await userModel.findByIdAndUpdate(
                { _id: data.userId },
                { $inc: { credit: serviceCharge } },
                { new: true }
              );
              //   console.log("addcredit...", addcredit._id);

              //add entry to payment model
              let paymentObj = {
                userId: data.userId,
                paymentDate: new Date(),
                orderId: data.orderId,
                paymentStatus: "complete",
                orderTrackingStatus: data.orderTrackingStatus,
                transactionAmount: serviceCharge,
                transactionType: "creditServiceCharge",
                message: "service charge + extra charge is given.",
              };
              let newPaymentData = new paymentModel(paymentObj);
              let savPaymentHis = await newPaymentData.save();
              //update orderHistoryModel
              let a7 = await orderHistoryModel.findOneAndUpdate(
                { orderId: data.orderId },
                {
                  orderTrackingStatus: "cancel",
                  isRefund: false,
                  serviceCharge: serviceCharge,
                },
                { new: true }
              );
              if (!a7) {
                addToOrderHistory(
                  data.userId,
                  data.userName,
                  savPaymentHis._id,
                  savPaymentHis.paymentDate,
                  savPaymentHis.paymentStatus,
                  data.orderId,
                  data.orderTrackingStatus,
                  data.trackingNo,
                  data.trackingURL,
                  data.grandTotal,
                  savPaymentHis.transactionType,
                  data.address,
                  userId,
                  adminData,
                  data.serviceName,
                  data.courierServiceId,
                  data.amount
                );
              }
              //   console.log("a7...", a7._id);

              //send notification of cancel order
              notify = await notification(
                data.userId,
                "Your order is cancel",
                "cancel",
                "order",
                data.orderId
              );
            }
            // else {
            //     rej({ status: 404, message: "order doesn't have insurance. You can not refund!!" })
            // }
            let a9 = await orderHistoryModel.findOneAndUpdate(
              { orderId: data.orderId },
              { address: data.address, consignName: data.consignName },
              { new: true }
            );

            let updateData = await orderModel.findByIdAndUpdate(
              { _id: data.orderId },
              {
                consignName: data.consignName,
                address: data.address,
                product: data.product,
              },
              { new: true }
            );
            console.log("updateData...", updateData._id);

            let orderHisData = await orderHistoryModel.findOneAndUpdate(
              { orderId: data.orderId },
              {
                consignName: data.consignName,
                address: data.address,
              },
              { new: true }
            );

            if (updateData && orderHisData) {
              console.log("yes in data....");
              res({ status: 200, data: {} });
            }
          } else {
            rej({
              status: 404,
              message: "you can not edit this order !!",
            });
          }
        } else {
          rej({ status: 404, message: "Invalid order id!!" });
        }
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  getUser: () => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await userModel.aggregate([
          {
            $match: { userStatus: "active" },
          },
          {
            $project: {
              Name: { $concat: ["$firstName", " ", "$lastName"] },
            },
          },
        ]);
        if (getData) res({ status: 200, data: getData });
        else rej({ status: 500, message: "something went wrong!!" });
      } catch (err) {
        console.log("error", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  orderCount: () => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await orderModel.aggregate([
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

  extraCharge: (userId, orderId, amount, message) => {
    return new Promise(async (res, rej) => {
      try {
        let check = await orderModel.findById(orderId, {
          _id: 1,
          userId: 1,
          extraCharge: 1,
        });
        if (check.extraCharge) {
          amount += check.extraCharge;
        }
        let orderData = await orderModel.findByIdAndUpdate(
          orderId,
          { $inc: { extraCharge: amount } },
          { new: true }
        );
        let orderHisData = await orderHistoryModel.findOneAndUpdate(
          { orderId: orderId },
          { $inc: { extraCharge: amount } },
          { new: true }
        );
        let userData = await userModel.findByIdAndUpdate(
          orderData.userId,
          { $inc: { credit: -amount } },
          { new: true }
        );

        if (userData.credit < 0) {
          let updateUserData = await userModel.findByIdAndUpdate(
            orderData.userId,
            { $inc: { credit: amount } }
          );
          rej({ status: 404, message: "Not enough credit in user wallet!!" });
        } else {
          //add to record payment model
          let paymentObj = {
            userId: userData._id,
            paymentDate: new Date(),
            orderId: orderId,
            paymentStatus: "complete",
            orderTrackingStatus: orderData.orderTrackingStatus,
            transactionAmount: amount,
            transactionType: "debitExtraCharge",
            adminId: userId,
            message: message,
          };
          let newPaymentData = new paymentModel(paymentObj);
          let savPaymentHis = await newPaymentData.save();
          // notification
          let notify = await notification(
            userId,
            "Amount debited successfully!!",
            "extra charges!!",
            "payment"
          );
          if (savPaymentHis) {
            res({ status: 200, data: {} });
          } else {
            rej({ status: 500, message: "something went wrong!!" });
          }
        }
      } catch (err) {
        console.log("error", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  //rutu
  inVoice: (userId, page, limit, startDate, endDate) => {
    return new Promise(async (res, rej) => {
      try {
        console.log("userId invoice: ", userId);
        page = parseInt(page);
        limit = parseInt(limit);
        let qry = {};
        if (startDate && endDate) {
          startDate = new Date(startDate);
          endDate = new Date(endDate);
          endDate.setDate(endDate.getDate() + 1);
          qry["$and"] = [
            { "paymentOrderData.createdAt": { $gt: startDate } },
            { "paymentOrderData.createdAt": { $lt: endDate } },
          ];
        }
        // console.log("startDate..." + startDate + "endDate...." + endDate)
        // console.log("qry.....", qry)
        let order = await orderModel.findOne({ userId });
        if (qry && startDate && endDate) {
          let getData = await paymentModel.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
              $lookup: {
                from: "orders",
                localField: "orderId",
                foreignField: "_id",
                as: "paymentOrderData",
              },
            },
            { $unwind: "$paymentOrderData" },
            { $match: qry },
            {
              $lookup: {
                from: "courierservices",
                localField: "paymentOrderData.courierServiceId",
                foreignField: "_id",
                as: "OrderServiceData",
              },
            },
            { $unwind: "$OrderServiceData" },
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
                      orderId: 1,
                      logo: "$OrderServiceData.image",
                      // p2gRef:'$trackingNO',
                      postCode: "$paymentOrderData.address1.pincode",
                      item: "$paymentOrderData.product.content",
                      serviceName: "$paymentOrderData.serviceName",
                      courierServiceId: "$paymentOrderData.courierServiceId",
                      createdAt: "$paymentOrderData.createdAt",
                      updatedAt: "$paymentOrderData.updatedAt",
                      paymentId: "$_id",
                      paymentDate: 1,
                      paymentStatus: 1,
                      orderTrackingStatus: 1,
                      trackingNo: "$paymentOrderData.trackingNo",
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
          getData = getData[0];
          if (getData) {
            if (getData.result.length > 0) {
              res({
                status: 200,
                data: {
                  total_count: getData.total_count[0].count,
                  result: getData.result,
                },
              });
            } else {
              rej({ status: 404, message: "No data found!!" });
            }
          } else rej({ status: 404, message: "something went wrong!!" });
        } else {
          rej({ status: 500, message: "Please enter startDate & endDate" });
        }
      } catch (err) {
        console.log("error", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  // billAmount: async (userId, startDate, endDate) => {
  //     console.log("userId.........", userId);
  //     return new Promise(async (res, rej) => {
  //         try {
  //             let qry = {};
  //             if (startDate && endDate) {
  //                 startDate = new Date(startDate);
  //                 endDate = new Date(endDate);
  //                 endDate.setDate(endDate.getDate() + 1);
  //                 qry["$and"] = [
  //                     { createdAt: { $gt: startDate } },
  //                     { createdAt: { $lt: endDate } },
  //                 ];
  //             }
  //             let orderHistoryData = await orderHistoryModel.findOne({ userId })
  //             let getData = await orderModel.aggregate([
  //                 {
  //                     $match: { userId: mongoose.Types.ObjectId(userId) },
  //                 },
  //                 {
  //                     $project: {
  //                         orderTrackingStatus: 1,
  //                         isRefund: 1,
  //                         grandTotal: 1
  //                     },
  //                 },
  //             ]);
  //             // console.log("getData.........", getData);
  //             // console.log("orderHistoryData.serviceCharge.........", orderHistoryData.serviceCharge);
  //             if (getData.length > 0) {
  //                 let totalOrderCnt = 0;
  //                 let totalOrderAmount = 0;
  //                 let cancelOrderCnt = 0;
  //                 let cancelOrderAmount = 0;
  //                 let refundOrderCnt = 0;
  //                 let refundOrderAmount = 0;
  //                 let finalAmount = 0;
  //                 let i;
  //                 for (i = 0; i < getData.length; i++) {
  //                     if (
  //                         getData[i].orderTrackingStatus == "cancel" &&
  //                         getData[i].isRefund === true
  //                     ) {
  //                         refundOrderCnt++,
  //                             (refundOrderAmount = refundOrderAmount + getData[i].grandTotal + orderHistoryData.serviceCharge);
  //                     }
  //                     if (getData[i].orderTrackingStatus == "cancel") {
  //                         cancelOrderCnt++,
  //                             (cancelOrderAmount += getData[i].grandTotal);
  //                     }
  //                     if (getData[i].orderTrackingStatus == "parcelDispatch" || getData[i].orderTrackingStatus == "cancel" || getData[i].orderTrackingStatus == "pending" || getData[i].orderTrackingStatus == "complete") {
  //                         totalOrderCnt++,
  //                             (totalOrderAmount += getData[i].grandTotal);
  //                     }
  //                     finalAmount = totalOrderAmount - refundOrderAmount
  //                 }
  //                 if (i == getData.length) {
  //                     res({
  //                         status: 200,
  //                         data: {
  //                             totalOrderCnt,
  //                             cancelOrderCnt,
  //                             refundOrderCnt,
  //                             totalOrderAmount,
  //                             cancelOrderAmount,
  //                             refundOrderAmount,
  //                             finalAmount
  //                         },
  //                     });
  //                 }
  //             } else {
  //                 res({ status: 404, message: "No data found!" });
  //             }
  //         } catch (err) {
  //             console.log("err..", err);
  //             rej({ status: 500, error: err, message: "something went wrong!!" });
  //         }
  //     });
  // },

  billObj: async (userId, startDate, endDate) => {
    console.log("userId billobj: ", userId);
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
            },
          },
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
};
