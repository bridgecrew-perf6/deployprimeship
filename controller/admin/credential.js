let { response } = require("../../middleware/responsemiddleware");
const service = require("../../service/admin/credential");
exports.updateService = async (req, res) => {
  try {
    let resp = await service.updateService(req.body.allow);
    if (resp) {
      return response("SUCCESS..!!", resp.data, 200, res);
    } else {
      return response("Error..!!", err.error, err.status, res);
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.getService = async (req, res) => {
  try {
    let resp = await service.getService(req.userId);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("something went wrong !!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
