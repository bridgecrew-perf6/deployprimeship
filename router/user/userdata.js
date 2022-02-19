const { Router } = require("express");
const userDataRoute = Router();
const userDataController = require("../../controller/user/userdata");
const { verifyUserToken } = require("../../middleware/verifytoken");

userDataRoute.get("/", userDataController.get);

module.exports = userDataRoute;
