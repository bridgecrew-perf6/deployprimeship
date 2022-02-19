const commonController = require("../../controller/common");
const orderController = require("../../controller/admin/order");
const { Router } = require("express");
const orderRoute = Router();
const { verifyAdminToken } = require("../../middleware/verifytoken");

orderRoute.post("/findService", commonController.findService);
orderRoute.post("/placeOrder", commonController.placeOrder);
orderRoute.post("/addForwardingNo", orderController.addForwardingNo);
orderRoute.get("/byId/:orderId", commonController.byId);
orderRoute.get("/", orderController.get);
orderRoute.put("/edit", orderController.edit);
orderRoute.get("/getUser", orderController.getUser);
orderRoute.get("/orderCount", orderController.orderCount);
orderRoute.put("/extraCharge", orderController.extraCharge);
orderRoute.get("/inVoice/:_id", orderController.inVoice);
orderRoute.get("/billObj/:_id", orderController.billObj);

module.exports = orderRoute;
