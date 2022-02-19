const { string } = require("joi")
const { Schema, model } = require("mongoose")

let inquirySchema = new Schema({
    firstName: {
        type: String,
        required:true
    },
    lastName: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required:true
    },
    message: {
        type: String
    },
    image:[{
        type:String
    }]
}, { timestamps: true })

module.exports = model("inquiry", inquirySchema)