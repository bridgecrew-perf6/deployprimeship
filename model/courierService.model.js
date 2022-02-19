
const { Schema, model } = require("mongoose")

const serviceSchema = new Schema({
    name: {
        type: String,
        trim: true,
        minLength: [2, "at least have two character as service name"],
        required: true,
    },
    countryId: [{
        type: Schema.Types.ObjectId,
        ref: "countries"
    }],
    image: {
        type: String,
        trim: true,
    },
    trackingURL: {
        type: "String"
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: "admins"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })
serviceSchema.index({ name: 1 })

module.exports = model("courierservice", serviceSchema)