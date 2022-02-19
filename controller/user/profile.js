let service = require("../../service/user/profile");
let { response } = require("../../middleware/responsemiddleware");

exports.get = async (req, res) => {
  try {
    // console.log("in get",req.userId)
    let resp = await service.get(req.userId);
    // console.log("resp",resp)
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    // return response(err.message, err?.error, err.status, res)
    console.log("err..", err);
    return response(err.message, err?.error, err.status, res);
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body.password && !req.body.credit) {
      let resp = await service.update(req.userId, req.body);
      if (resp) return response("SUCCESS..!!", resp.data, 200, res);
      else return response("Error..!!", {}, 500, res);
    } else {
      res.send("You cannot update your password or your credit amount....");
      // response("You cannot update your password....", err.error, err.status, res)
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.image = async (req, res) => {
  try {
    console.log("req.userId controller..", req.userId);
    let resp = await service.image(req.userId, req.file);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    let resp = await service.resetPassword(
      req.userId,
      req.body.oldPassword,
      req.body.newPassword
    );
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

// exports.image = async (req, res) => {
//   try {
//     let resp = await service.image(req.userId, req.file);
//     if (resp) return response("SUCCESS..!!", resp.data, 200, res);
//     else return response("Error..!!", {}, 500, res);
//   } catch (err) {
//     return response(err.message, err?.error, err.status, res);
//   }
// };

exports.resetProofImage = async (req, res) => {
  try {
    let resp = await service.resetProofImage(req.body);
    // let resp = await service.resetProofImage(req.body.email, req.body.password)
    // console.log("resp",resp)
    if (resp) return response("SUCCESS..!!", {}, 200, res);
    else return response("Error..!!", err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.wallet = async (req, res) => {
  try {
    if (!req.query.page || !req.query.limit) {
      return response("pagination is require for pagination..!!", {}, 404, res);
    } else {
      let resp = await service.wallet(
        req.userId,
        req.query.page,
        req.query.limit,
        req.query.transactionType
      );
      if (resp) return response("SUCCESS..!!", resp.data, 200, res);
      else return response("Error..!!", {}, 500, res);
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
