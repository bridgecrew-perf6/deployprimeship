let service = require("../../service/admin/dashBoard");
let { response } = require("../../middleware/responsemiddleware");

exports.get = async (req, res) => {
  try {
    let resp = await service.get();
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.notification = async (req, res) => {
  try {
    if (!req.query.page || !req.query.limit) {
      return response("pagination is require for pagination..!!", {}, 404, res);
    } else {
      if (
        req.query.type == "user" ||
        req.query.type == "order" ||
        req.query.type == "all"
      ) {
        let resp = await service.notification(
          req.query.page,
          req.query.limit,
          req.query.type
        );
        if (resp) return response("SUCCESS..!!", resp.data, 200, res);
        else return response("Error..!!", {}, 500, res);
      } else {
        response("only all, order and user type is allowed", {}, 500, res);
      }
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
