const { Router } = require("express");
const adminDataRoute = Router();
const adminDataController = require("../../controller/admin/adminData");
const { verifyAdminToken } = require("../../middleware/verifytoken");

adminDataRoute.get("/", adminDataController.get);
adminDataRoute.put("/update/:_id", adminDataController.update);
adminDataRoute.post("/sendNotification", adminDataController.sendNotification);

module.exports = adminDataRoute;
