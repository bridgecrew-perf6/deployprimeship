const userController = require("../../controller/user/order");
const commonController = require("../../controller/common");

const { Router } = require("express");
const { verifyUserToken } = require("../../middleware/verifytoken");
const {
  validateSchema,
  orderSchema,
  mobileCheck,
  veryfyMobileRegi,
} = require("../../middleware/validation");
const orderRouter = Router();

orderRouter.post("/findService", commonController.findService);
orderRouter.post(
  "/placeOrder",
  validateSchema(orderSchema),
  commonController.placeOrder
);
orderRouter.get("/", userController.get);
orderRouter.get("/byId/:orderId", commonController.byId);

orderRouter.get("/invoice", userController.inVoice);
orderRouter.get("/getCountry", commonController.getCountryList);
orderRouter.get("/trackOrder", userController.trackOrder);
orderRouter.get("/orderCount", userController.orderCount);

orderRouter.get("/billObj", userController.billObj);

module.exports = orderRouter;
