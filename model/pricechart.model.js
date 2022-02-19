const { Schema, model } = require("mongoose")

const pricechartSchema = new Schema({
    serviceId: {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: 'courierservices',
        required: true
    },
    countryId: {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: 'country',
        required: true
    },
    parcelGram: {
        type: Number,
        trim: true,
        required: true
    },
    price: {
        type: Number,
        trim: true,
        required: true
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: "admins"
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

module.exports = model("pricechart", pricechartSchema)