const { Schema, model } = require("mongoose")

let otpschema = new Schema({
    mobile: {
        type: Number
    },
    email: {
        type: String
    },
    otp: {
        type: String
    }
}, { timestamps: true })

module.exports = model('otp', otpschema)
