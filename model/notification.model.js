const { Schema, model } = require("mongoose")

let notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        // required:true,
        ref: "users"
    },
    message: {
        type: String
    },
    reason: {
        type: String
    },
    type: {
        type: String,
        // required: true,
        //default
        enum: ["payment", "admin", "order", "user"]
    },
    adminId:{
        type: Schema.Types.ObjectId,
        // required:true,
        ref: "admins"
    },
    orderId:{
        type: Schema.Types.ObjectId,
        // required:true,
        ref: "orders"
    }
}, { timestamps: true })

module.exports = model("notification", notificationSchema)
