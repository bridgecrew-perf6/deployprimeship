const userModel = require("../../model/user.model")
const paymentModel = require("../../model/payment.model")
const mongoose = require("mongoose")
const { string } = require("joi")
const notificationModel = require("../../model/notification.model")
let { notification } = require("../../helper/notification")
const orderModel = require("../../model/order.model")

module.exports = {
    
    unVerified: (str, userStatus, verifiedStatus, page, limit) => {
        return new Promise(async (res, rej) => {
            try {
                page = parseInt(page)
                limit = parseInt(limit)
                let qry = { verifiedStatus: { '$in': ["pending", "reject"] } }
                if (str) {
                    qry['$or'] = [
                        { 'firstName': { $regex: str, $options: 'i' } },
                        { 'lastName': { $regex: str, $options: 'i' } },
                        { 'email': { $regex: str, $options: 'i' } },
                        {
                            "$expr": {
                                "$regexMatch": {
                                    "input": { "$toString": "$mobile" },
                                    "regex": str
                                }
                            }
                        }
                    ]
                }
                if (userStatus) {
                    console.log("userStatus...", userStatus);
                    qry['userStatus'] = userStatus
                }
                if (verifiedStatus) {
                    console.log("verifiedStatus....", verifiedStatus);
                    qry['verifiedStatus'] = verifiedStatus
                }
                let getData = await userModel.aggregate([
                    { $match: qry },
                    {
                        $facet: {
                            total_count: [
                                {
                                    $group: {
                                        _id: null,
                                        count: { $sum: 1 }
                                    }
                                }
                            ],
                            result: [
                                {
                                    $project: {
                                        _id: 1,
                                        firstName: 1,
                                        lastName: 1,
                                        mobile: 1,
                                        email: 1,
                                        userStatus: 1,
                                        verifiedStatus: 1,
                                        profileImage: 1
                                    }
                                },
                                { $sort: { date: -1 } },
                                { $skip: (page - 1) * limit },
                                { $limit: limit }
                            ]
                        }
                    }
                ])
                getData = getData[0]
                if (getData.result.length > 0) {
                    let result = getData.result
                    let noTrack = []
                    let arr = []
                    for (let i = 0; i < result.length; i++) {
                        if (!result[i].mobile) {
                            noTrack.push(result[i])
                        }
                        else {
                            arr.push(result[i])
                        }
                    }
                    noTrack.push(...arr)
                    res({ status: 200, data: { total_count: getData.total_count[0].count, result: noTrack } })
                }
                else {
                    rej({ status: 404, message: "No data found!!" })
                }
                // res(getData)
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },
    
    updateStatus: (userId, userStatus, verifiedStatus, message) => {
        return new Promise(async (res, rej) => {
            try {
                let qry = {}
                if (message) {
                    qry['message'] = message
                }
                console.log("userId is.......", userId);
                let updateData = await userModel.findByIdAndUpdate(userId, { 'userStatus': userStatus, 'verifiedStatus': verifiedStatus, 'message': message }, { new: true })
                if (updateData) {
                    if (userStatus) {
                        let notify = notification(userId, `Your userStatus is updated to ${updateData.userStatus} with message ${updateData.message}`, 'UserStatus updated!!', 'admin')
                    }
                    else {
                        let notify = notification(userId, `Your verifiedStatus is updated to ${updateData.verifiedStatus} with message ${updateData.message}`, 'verifiedStatus updated!!', 'admin')
                    }
                    res({ status: 200, data: updateData })
                    // res({ status: 200, data: {} })
                }
                else {
                    rej({ status: 404, message: "Invalid admin id!!" })
                }
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    verify: (str, userStatus, page, limit) => {
        return new Promise(async (res, rej) => {
            try {
                console.log("in services try block.....")
                page = parseInt(page)
                limit = parseInt(limit)
                console.log("page...." + page + "   and limit....." + limit)
                let qry = { verifiedStatus: "approve" }
                if (str) {
                    qry['$or'] = [
                        { 'firstName': { $regex: str, $options: 'i' } },
                        { 'lastName': { $regex: str, $options: 'i' } },
                        { 'email': { $regex: str, $options: 'i' } },
                        {
                            "$expr": {
                                "$regexMatch": {
                                    "input": { "$toString": "$mobile" },
                                    "regex": str
                                }
                            }
                        }
                    ]
                }
                if (userStatus) {
                    qry['userStatus'] = userStatus
                }
                let getData = await userModel.aggregate([
                    { $match: qry },
                    {
                        $facet: {
                            total_count: [
                                {
                                    $group: {
                                        _id: null,
                                        count: { $sum: 1 }
                                    }
                                }
                            ],
                            result: [
                                {
                                    $project: {
                                        _id: 1,
                                        firstName: 1,
                                        lastName: 1,
                                        mobile: 1,
                                        email: 1,
                                        userStatus: 1,
                                        verifiedStatus: 1,
                                        profileImage: 1
                                    }
                                },
                                { $sort: { date: -1 } },
                                { $skip: (page - 1) * limit },
                                { $limit: limit }
                            ]
                        }
                    }
                ])
                getData = getData[0]
                // console.log(getData)
                if (getData.result.length > 0) {
                    let result = getData.result
                    let noTrack = []
                    let arr = []
                    for (let i = 0; i < result.length; i++) {
                        if (!result[i].mobile) {
                            noTrack.push(result[i])
                        }
                        else {
                            arr.push(result[i])
                        }
                    }
                    noTrack.push(...arr)
                    res({ status: 200, data: { total_count: getData.total_count[0].count, result: noTrack } })
                    // res({ status: 200, data: getData })
                }
                else {
                    rej({ status: 404, message: "No data found!!" })
                }
                // res(getData)
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    getProofImg: (_id) => {
        return new Promise(async (res, rej) => {
            try {
                let getData = await userModel.aggregate([
                    {
                        $match: {
                            _id: mongoose.Types.ObjectId(_id)
                        }
                    },
                    {
                        $project: {
                            aadharCardFrontImg: 1,
                            aadharCardBackImg: 1,
                            panCardImg: 1,
                            gstImg: 1,
                            gstNo: 1
                        }
                    }
                ])
                if (getData) {
                    res({ status: 200, data: getData })
                }
                else {
                    rej({ status: 404, message: "Invalid admin id!!" })
                }
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    getPaymentData: (userId, page, limit, transactionType) => {
        return new Promise(async (res, rej) => {
            try {
                console.log("userId........", userId)
                page = parseInt(page)
                limit = parseInt(limit)
                let qry = {}
                let project = {}
                qry = { userId: mongoose.Types.ObjectId(userId) }
                if (transactionType && transactionType !== 'all') {
                    qry['transactionType'] = transactionType
                    if (transactionType == 'credit') {
                        project = {
                            _id: 1,
                            transactionAmount: 1,
                            paymentDate: 1,
                            transactionType: 1,
                            paymentStatus: 1,
                            orderId: 1,
                            message: 1
                        }
                    }
                    else {
                        project = {
                            _id: 1,
                            transactionAmount: 1,
                            paymentDate: 1,
                            transactionType: 1,
                            orderId: 1,
                            message: 1,
                            serviceName: { $first: '$paymentOrderData.serviceName' }
                        }
                    }
                }
                else {
                    project = {
                        _id: 1,
                        transactionAmount: 1,
                        paymentDate: 1,
                        transactionType: 1,
                        paymentStatus: 1,
                        orderId: 1,
                        message: 1,
                        serviceName: { $first: '$paymentOrderData.serviceName' }
                    }
                }
                let user = await userModel.findById(userId)
                let getData = await paymentModel.aggregate([
                    { $match: qry },
                    {
                        $lookup: {
                            from: "orders",
                            localField: "userId",
                            foreignField: "userId",
                            as: "paymentOrderData"
                        }
                    },
                    {
                        $facet: {
                            total_count: [
                                {
                                    $group: {
                                        _id: null,
                                        count: { $sum: 1 }
                                    }
                                }
                            ],
                            result: [
                                {
                                    $project: project
                                },
                                { $sort: { paymentDate: -1 } },
                                { $skip: (page - 1) * limit },
                                { $limit: limit }
                            ]
                        }
                    }
                ])
                getData = getData[0]
                // console.log(getData)
                if (getData.result.length > 0) {
                    res({ status: 200, data: { wallet_amount: user.credit, total_count: getData.total_count[0].count, result: getData.result } })
                    // res({ status: 200, data: getData })
                }
                else {
                    rej({ status: 404, message: "No data found!!" })
                }
                // res(getData)
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    addCredit: (_id, credit, data) => {
        return new Promise(async (res, rej) => {
            try {
                console.log("userId........", _id)
                let prevoiusData = await userModel.findOne({ _id }, { credit })
                console.log("previousCredit.....", prevoiusData.credit)
                let updatedData = prevoiusData.credit + data.credit
                // console.log("total......",updatedData=prevoiusData.credit+data.credit)
                console.log("updatedData....", updatedData)
                let getData = await userModel.findByIdAndUpdate(_id, { credit: updatedData, 'profileImage': data.profileImage }, { new: true })
                if (getData) {
                    let paymentObj = {
                        'userId': _id,
                        'paymentDate': new Date(),
                        // 'orderId': orderId,
                        'paymentStatus': data.paymentStatus,
                        'orderTrackingStatus': data.paymentStatus,
                        'transactionAmount': credit,
                        'transactionType': 'credit',
                        'paymentProofImg': data.paymentProofImg
                    }
                    let newPaymentData = new paymentModel(paymentObj)
                    let savPaymentHis = await newPaymentData.save()
                    res({ status: 200, data: getData })
                    let notify = await notification(_id, `${credit} added to your wallet and your current wallet balance is ${getData.credit}`, "add amount", "payment")
                }
                else {
                    rej({ status: 404, message: "No data found!!" })
                }
                // res(getData)
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    activeUser: (_id, paymentProofImg, paymentStatus) => {
        return new Promise(async (res, rej) => {
            try {
                console.log("userId.......", _id)
                let getData = await paymentModel.findByIdAndUpdate({ _id }, { paymentProofImg: paymentProofImg, paymentStatus: paymentStatus }, { new: true })
                if (getData) {
                    res({ status: 200, data: getData })
                    let paymentObj = {
                        'userId': _id,
                        'paymentDate': new Date(),
                        // 'orderId': orderId,
                        'paymentStatus': data.paymentStatus,
                        'orderTrackingStatus': 'pending',
                        'transactionAmount': differenceData,
                        'transactionType': 'credit',
                        'paymentProofImg': data.paymentProofImg
                    }
                    let newPaymentData = new paymentModel(paymentObj)
                    let savPaymentHis = await newPaymentData.save()
                }
                else {
                    rej({ status: 404, message: "Invalid user id!!" })
                }
                // res(getData)
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },
}
