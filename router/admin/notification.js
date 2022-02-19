const { Router } = require("express");
const notificationRoute = Router();
const adminDataController = require("../../controller/admin/adminData");
const { verifyAdminToken } = require("../../middleware/verifytoken");

notificationRoute.post(
  "/sendNotification",
  adminDataController.sendNotification
);

module.exports = notificationRoute;
