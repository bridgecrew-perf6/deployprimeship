const { Router } = require("express");
const refundRoute = Router();
const refundController = require("../../controller/user/refund");
const { verifyUserToken } = require("../../middleware/verifytoken");

refundRoute.get("/", refundController.get);
refundRoute.get("/insurance", refundController.insurance);

module.exports = refundRoute;
