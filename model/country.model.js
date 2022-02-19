const { Schema, model } = require("mongoose")

const countrySchema = new Schema({
    name: {
        type: String,
        trim: true,
        minlength: [2, "at least 2 characters are needed for country name"],
        require: true

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
countrySchema.index({ name: 1 })

module.exports = model("country", countrySchema)