const adminModel = require("../../model/admin.model")
const mongoose = require("mongoose")
const { notification } = require("../../helper/notification")
const notificationModel = require("../../model/notification.model")

module.exports = {

    get: (_id) => {
        return new Promise(async (res, rej) => {
            try {
                let getData = await adminModel.aggregate([
                    {
                        $match: { _id: mongoose.Types.ObjectId(_id) }
                    },
                    {
                        $project: {
                            _id: 1,
                            firstName: 1,
                            lastName: 1,
                            role: 1,
                            email: 1,
                            profileImg: 1,
                            mobile: 1,
                            city: '$address.city',
                            state: '$address.state',
                            country: '$address.country',
                            status: 1
                        }
                    }
                ])
                if (getData) {
                    res({ status: 200, data: getData })
                }
                else {
                    rej({ status: 404, message: "Invalid admin id!!" })
                }
                // res(getData)
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    update: (_id, data) => {
        return new Promise(async (res, rej) => {
            try {
                let editData = await adminModel.findByIdAndUpdate(_id, data, {
                    new: true, projection: {
                        _id: 1,
                        firstName: 1,
                        lastName: 1,
                        role: 1,
                        email: 1,
                        profileImg: 1,
                        mobile: 1,
                        city: '$address.city',
                        state: '$address.state',
                        country: '$address.country',
                        status: 1
                    }
                })
                if (editData) {
                    // res({ status: 200, data: "Data Updated!!" })
                    res({ status: 200, data: editData })
                }
                else {
                    rej({ status: 500, message: "something went wrong!!" })
                }
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    sendNotification: (userId, message) => {
        // sendNotification:(data)=>{
        return new Promise(async (res, rej) => {
            try {
                let notificationObj = {
                    'adminId': userId,
                    'message': message,
                    'reason': 'admin has send notification to users',
                    'type': 'admin'
                }
                let newNotificationData = new notificationModel(notificationObj)
                let saveNotification = await newNotificationData.save()
                    //  notification(userId,message,'admin has send notification to users','admin')
                    .then((resp) => res({ status: 200, data: {} }))
                    .catch((err) => {
                        console.log("err..", err)
                        rej({ status: 404, message: "Invalid admin id!!" })
                    })
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    }
}
