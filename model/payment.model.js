const { string } = require("joi");
const { Schema, model } = require("mongoose");

const paymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    paymentDate: {
      type: Date,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "orders",
    },
    paymentStatus: {
      type: String,
      trim: true,
      default: "pending",
      enum: ["pending", "complete"],
    },
    orderTrackingStatus: {
      type: String,
      trim: true,
      enum: ["pending", "complete", "cancel", "parcelDispatch"],
    },
    transactionAmount: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: String,
      required: true,
      enum: [
        "refund",
        "credit",
        "debit",
        "noRefund",
        "debitExtraCharge",
        "creditServiceCharge",
      ],
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "admins",
    },
    paymentProofImg: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);
module.exports = model("payment", paymentSchema);
