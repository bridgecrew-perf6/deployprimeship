const aboutUsModel = require("../../model/about_us.model")
const mongoose = require("mongoose")

module.exports = {
    
    //first delete old about us data and than add new one
    add: (data) => {
        return new Promise(async (res, rej) => {
            try {
                // console.log("in services.....", data)
                aboutUsModel.deleteOne().then(async (result) => {
                    var newaboutUsModel = new aboutUsModel(data)
                    var adddata = await newaboutUsModel.save()
                    if (adddata) {
                        // console.log("saved data: ", adddata)
                        res({ status: 200, data: adddata })
                    }
                    else {
                        rej({ status: 500, message: "something went wrong!!" })
                    }
                })
                    .catch((err) => {
                        console.log(err)
                        rej({ status: 500, error: err, message: "something went wrong!!" })
                    })
            } catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    edit: (data) => {
        return new Promise(async (res, rej) => {
            try {
                let updateData = await aboutUsModel.findOneAndUpdate({}, { $set: data }, { upsert: true })
                if (updateData) {
                    res({ status: 200, data: "Data Updated!!" })
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
    }
}