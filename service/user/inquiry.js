const inquiryModel = require("../../model/inquiry.model")
const mongoose = require("mongoose")

module.exports = {
    
    add: (data) => {
        return new Promise(async (res, rej) => {
            try {
                let newInquiryModel = new inquiryModel(data)
                let addData = await newInquiryModel.save()
                if (addData)
                    res({ status: 200, data: {} })
                else
                    rej({ status: 500, message: "something went wrong!!" })
            }
            catch (err) {
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    }
}
