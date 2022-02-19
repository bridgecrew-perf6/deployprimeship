const commonService = require("../service/common");
let { response } = require("../middleware/responsemiddleware");
const userModel = require("../model/user.model");
// let imgService = require("../service/common")
const adminModel = require("../model/admin.model");

exports.getCountryList = async (req, res) => {
  try {
    let resp = await commonService.getCountryList(req.query?.str);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.findService = async (req, res) => {
  try {
    let resp = await commonService.findService(
      req.body.countryId,
      req.body.weight,
      req.body.length,
      req.body.width,
      req.body.height
    );
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.placeOrder = async (req, res) => {
  try {
    let userData = await userModel.findById({ _id: req.userId });
    let adminData = await adminModel.findById({ _id: req.userId });
    console.log("userData", userData);
    let resp;
    if (adminData && !userData) {
      if (!req.body.userId) {
        return response("please provide userId", {}, 404, res);
      } else {
        req.body.adminId = req.userId;
        resp = await commonService.placeOrder(req.body.userId, req.body);
      }
    } else {
      resp = await commonService.placeOrder(req.userId, req.body);
    }
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.byId = async (req, res) => {
  try {
    console.log("in get", req.params.orderId);
    let resp = await commonService.byId(req.params.orderId);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.getAboutUs = async (req, res) => {
  try {
    let resp = await commonService.getAboutUs();
    if (resp) return response("SUCCESS..!!", resp.data[0], 200, res);
    else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.upload = async (req, res) => {
  try {
    let resp = await commonService.upload(req.file);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.delete = async (req, res) => {
  try {
    let resp = await commonService.delete(req.body.imgName);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
