const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { string, boolean, array } = require("joi");
let address = new Schema({
  addressName: {
    type: String,
  },
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
  addressDescrption: {
    type: String,
    min: [1, "atleast have something"],
  },
});

const adminSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      trim: true,
      enum: ["superAdmin", "staff"],
      required: true,
    },
    mobile: {
      type: Number,
      trim: true,
      //regex of mobile
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/],
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    address: {
      type: address,
    },
    status: {
      type: String,
      enum: ["active", "deactive"],
      default: "active",
      // required:true
    },
    profileImg: {
      type: String,
    },
    isCheck: {
      type: Boolean,
    },
    service: {
      type: Array,
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

module.exports = model("admin", adminSchema);
