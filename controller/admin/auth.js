let service = require("../../service/admin/auth");
let { response } = require("../../middleware/responsemiddleware");
let adminModel = require("../../model/admin.model");
const { verifyAdminToken } = require("../../middleware/verifytoken");

exports.login = async (req, res) => {
  try {
    let resp = await service.login(
      req.body?.mobile,
      req.body?.email,
      req.body.password,
      // req.body.allow
    );
    console.log("resp", resp);
    if (resp) return response("SUCCESS..!!", resp.token, 200, res);
    else return response("Error..!!", err.status, res);
  } catch (err) {
    console.log("err...", err);
    return response(err.message, err?.error, err.status, res);
  }
};
