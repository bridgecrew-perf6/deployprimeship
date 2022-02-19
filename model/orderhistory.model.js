const { boolean } = require("joi");
const { Schema, model } = require("mongoose");

let address = new Schema({
  // isDefault: {
  //     type: Boolean,
  //     default: false
  // },
  // addressName: {
  //     type: String
  // },
  country: {
    type: String,
    required: [true, "country is required"],
  },
  state: {
    type: String,
    required: [true, "state is required"],
  },
  city: {
    type: String,
    required: [true, "city is required"],
  },
  pincode: {
    type: String,
    required: [true, "pincode is necessary for deliver the prodcut"],
  },
  addressDescrption1: {
    type: String,
    min: [1, "atleast have something"],
  },
  addressDescrption2: {
    type: String,
    min: [1, "atleast have something"],
  },
});
const orderhisSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    userName: {
      type: String,
      // required: true
    },
    consignName: {
      type: String,
      // required: true
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "payments",
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "orders",
    },
    orderTrackingStatus: {
      type: String,
      required: true,
    },
    trackingNo: {
      type: Number,
    },
    trackingURL: {
      type: "String",
    },
    transactionAmount: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: String,
      required: true,
      enum: ["refund", "credit", "debit", "noRefund", "creditServiceCharge"],
    },
    address: {
      type: address,
    },
    adminid: {
      type: Schema.Types.ObjectId,
      ref: "admins",
    },
    adminName: {
      type: String,
      required: true,
    },
    refund: {
      type: Number,
    },
    refundDate: {
      type: Date,
    },
    isRefund: {
      type: Boolean,
      default: false,
    },
    serviceCharge: {
      type: Number,
    },
    grandTotal: {
      type: Number,
    },
    serviceName: {
      type: String,
    },
    extraCharge: {
      type: Number,
    },
  },
  { timestamps: true }
);
module.exports = model("orderhistory", orderhisSchema);
