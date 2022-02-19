edit: (userId, data) => {
    return new Promise(async (res, rej) => {
        try{
            let notify;
            let adminData = await adminModel.findById(userId);
            adminData = adminData.firstName + " " + adminData.lastName;
    
            //check orderId is valid or not
            let orderData = await orderModel.findById(data.orderId);
            if(orderData){
                if (
                    !(
                      (!orderData.insurance &&
                        orderData.orderTrackingStatus == "cancel") ||
                      (orderData.insurance &&
                        orderData.orderTrackingStatus == "cancel" &&
                        orderData.isRefund)
                    )
                  )
                  {
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
                          if (!( orderData.trackingNo &&orderData.trackingNo == data.trackingNo)) {
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
                    //want cancel order
                    if(data.orderTrackingStatus === "cancel" ){
                        //notification
                        notify = await notification(
                            data.userId,
                            "Your order is cancel",
                            "cancel",
                            "order",
                            data.orderId
                            );

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
                          await orderModel.findByIdAndUpdate({_id:orderData._id},{orderTrackingStatus:"cancel"},{new:true})
                        
                          let a4 = await userModel.findByIdAndUpdate(
                            { _id: data.userId },
                            { $inc: { credit: orderData.amount + orderData.extraCharge } },
                            { new: true }
                        );

                        if(data.refund &&orderData.insurance == true)
                        {
                            if (orderData.product.itemValue < data.refund) {
                                rej({
                                  status: 404,
                                  message: "Refund should not more than itemValue!!",
                                });
                            }
                            else{
                                let a3 = await orderModel.findByIdAndUpdate(
                                    { _id: data.orderId },
                                    {
                                      refund: data.refund,
                                      isRefund: true,
                                    },
                                    { new: true }
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
                                    
                                    //send notification of refund
                                    notify = await notification(
                                        data.userId,
                                        `You got refund ${data.refund}`,
                                        "refund",
                                        "payment",
                                        data.orderId
                                    );
                            }
                          
                        }
                        else{
                            rej({ status: 500, error: err, message: "no insurance or already refunded!!" });
                        }
                    }
                  }
                  else{
                    rej({ status: 500, error: err, message: "This order can not be edited!!" });
                  }
            }
            else{
                rej({ status: 500, error: err, message: "Invalid order Id!!" });
            }
        }
        catch (err) {
            console.log("err..", err);
            rej({ status: 500, error: err, message: "something went wrong!!" });
          }
    }
}