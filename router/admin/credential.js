const { Router } = require("express");
const credentialRoute = Router();
const credenController = require("../../controller/admin/credential");

const {
  verifySuperAdminToken,
  verifyStaffToken,
} = require("../../middleware/verifytoken");

credentialRoute.get(
  "/getService",
  verifyStaffToken,
  credenController.getService
);

credentialRoute.put(
  "/updateService",
  verifySuperAdminToken,
  credenController.updateService
);
module.exports = credentialRoute;
