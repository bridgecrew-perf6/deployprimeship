const Joi = require("joi");
const { response } = require("./responseMiddleware");
const userModel = require("../model/user.model");
const adminModel = require("../model/admin.model");
const orderModel = require("../model/order.model");
// const gstValidator = require("gstin-validator")

getResult = async (result, res, next) => {
  try {
    if (result.error)
      return response("Validation error!!", false, 422, result.error.details);
    else next();
  } catch (err) {
    return response(
      "something went wrong in validation",
      result.error.details,
      422,
      res
    );
  }
};

exports.userSchema = Joi.object({
  firstName: Joi.string().min(1).max(255).required(),
  lastName: Joi.string().min(1).max(255).required(),
  mobile: Joi.number()
    .integer()
    .min(10 ** 9)
    .max(10 ** 10 - 1)
    .required(),
  email: Joi.string().required(),
  password: Joi.string().min(4).max(255).required(),
  aadharCardFrontImg: Joi.string(),
  aadharCardBackImg: Joi.string(),
  panCardImg: Joi.string(),
  gstImg: Joi.string(),
  isCheck: Joi.boolean(),
  bio: Joi.string(),
  gstNo: Joi.string(),
  message: Joi.string(),
});

exports.adminSchema = Joi.object({
  firstName: Joi.string().min(1).max(255).required(),
  lastName: Joi.string().min(1).max(255).required(),
  mobile: Joi.number()
    .integer()
    .min(10 ** 9)
    .max(10 ** 10 - 1)
    .required(),
  email: Joi.string().required(),
  password: Joi.string().min(4).max(255).required(),
  role: Joi.string(),
  isDeleted: Joi.boolean(),
  status: Joi.string(),
  address: Joi.array()
    .items(
      Joi.object({
        addressName: Joi.string(),
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        pincode: Joi.number().required(),
        addressDescrption: Joi.string().min(1).required(),
      })
    )
    .required(),
  profileImg: Joi.string(),
  isCheck: Joi.boolean,
  service: Joi.array(),
});

exports.orderSchema = Joi.object({
  // userId:Joi.object().required(),
  courierServiceId: Joi.string(),
  mobile: Joi.number()
    .integer()
    .min(10 ** 9)
    .max(10 ** 10 - 1)
    .required(),
  orderTrackingStatus: Joi.string(),
  trackingNo: Joi.string(),
  trackingURL: Joi.string(),
  amount: Joi.number(),
  address: Joi.object({
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    pincode: Joi.string().required(),
    addressDescrption1: Joi.string().min(1).required(),
    addressDescrption2: Joi.string().min(1),
  }).required(),
  product: Joi.object({
    content: Joi.string().required(),
    height: Joi.number(),
    weight: Joi.number(),
    length: Joi.number(),
    width: Joi.number(),
    qty: Joi.number().required(),
    itemValue: Joi.number().required(),
  }).required(),
  refund: Joi.number(),
  consignName: Joi.string().required(),
  serviceName: Joi.string().required(),
  insurance: Joi.boolean(),
});

exports.orderhisSchema = Joi.object({
  userName: Joi.string(),
  consignName: Joi.string(),
  paymentDate: Joi.date(),
  paymentStatus: Joi.string().required(),
  orderTrackingStatus: Joi.string().required(),
  trackingNO: Joi.number(),
  trackingURL: Joi.string(),
  transactionAmount: Joi.number().required(),
  transactionType: Joi.string().required(),
  adminName: Joi.string().required(),
  address: Joi.array()
    .items(
      Joi.object({
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        pincode: Joi.string().required(),
        addressDescrption: Joi.string().min(1).required(),
      })
    )
    .required(),
});

exports.validateSchema = (schema) => {
  return function (req, res, next) {
    let result = schema.validate(req.body);
    if (result.error)
      response("Validation error", result.error.details, 422, res);
    else next();
  };
};

exports.mobileCheck = async (req, res, next) => {
  try {
    let isMobile = await userModel.findOne({ mobile: req.body.mobile });
    if (isMobile) response("Mobile number is already exist!!", {}, 404, res);
    else next();
  } catch (err) {
    response("something went wrong!!", err, 500, res);
  }
};

exports.orderMobileCheck = async (req, res, next) => {
  try {
    let isMobile = await orderModel.findOne({ mobile: req.body.mobile });
    if (isMobile) response("Mobile number is already exist!!", {}, 404, res);
    else next();
  } catch (err) {
    response("something went wrong!!", err, 500, res);
  }
};

exports.adminMobileCheck = async (req, res, next) => {
  try {
    let isMobile = await adminModel.findOne({ mobile: req.body.mobile });
    if (isMobile) response("Mobile number is already exist!!", {}, 404, res);
    else next();
  } catch (err) {
    response("something went wrong!!", err, 500, res);
  }
};

exports.veryfyMobileRegi = async (req, res, next) => {
  try {
    let isMobile = await userModel.findOne({ mobile: req.body.mobile });
    console.log("isMobile", isMobile);
    if (req.body.type == "register") {
      if (isMobile) response("Mobile number already exist!!", {}, 404, res);
      else next();
    } else if (req.body.type == "forgotPassword") {
      if (isMobile) next();
      else response("Mobile number does not exist!!", {}, 404, res);
    }
  } catch (err) {
    response("something went wrong!!", err, 500, res);
  }
};
