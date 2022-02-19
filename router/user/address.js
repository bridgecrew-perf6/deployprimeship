const { Router } = require("express");
const addressRoute = Router();
const addressController = require("../../controller/user/address");
const { verifyUserToken } = require("../../middleware/verifytoken");

addressRoute.post("/", addressController.add);
addressRoute.put("/:addressId", addressController.update);
addressRoute.delete("/:addressId", addressController.delete);

module.exports = addressRoute;
