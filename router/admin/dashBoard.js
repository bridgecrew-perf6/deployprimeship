const { Router } = require("express");
const dashBoardRoute = Router();
const dashBoardController = require("../../controller/admin/dashBorad");

dashBoardRoute.get("/", dashBoardController.get);
// dashBoardRoute.get("/notification", dashBoardController.notification);

module.exports = dashBoardRoute;
