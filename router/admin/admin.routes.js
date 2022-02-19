const { Router } = require("express");
const adminRoute = Router();

const serviceRoute = require("./service");
const aboutUsRoute = require("./about_us");
const authRoute = require("./auth");
const staffRoute = require("./staff");
const adminDataRoute = require("./admindata");
const orderRoute = require("./order");
const userManageRoute = require("./userManage");
const dashBoardRoute = require("./dashBoard");
const imgRoute = require("./image");
const emailManagementRoute = require("./emailManagement");
const notificationRoute = require("./notification");
const credientialRoute = require("./credential");
adminRoute.get("/", (req, res) => {
  res.status(200).json({ message: "admin route is working" });
});

const {
  verifyAdminToken,
  verifySuperAdminToken,
  verifyStaffToken,
} = require("../../middleware/verifytoken");

adminRoute.use("/service", verifyAdminToken(5), serviceRoute);
adminRoute.use("/aboutUS", verifyAdminToken(3), aboutUsRoute);
adminRoute.use("/auth", authRoute);
adminRoute.use("/staff", verifyAdminToken(2), staffRoute);
adminRoute.use("/adminData", verifyAdminToken(7), adminDataRoute);
adminRoute.use("/order", verifyAdminToken(4), orderRoute);
adminRoute.use("/userManage", verifyAdminToken(1), userManageRoute);
adminRoute.use("/notification", verifyAdminToken(10), notificationRoute);

adminRoute.use("/dashBoard", verifyAdminToken(8), dashBoardRoute);

adminRoute.use("/image", imgRoute);
adminRoute.use("/emailManagement", verifyAdminToken(6), emailManagementRoute);
adminRoute.use("/credential", verifyAdminToken(9), credientialRoute);
//

// adminRoute.use("/service", serviceRoute);
// adminRoute.use("/aboutUS", aboutUsRoute);
// adminRoute.use("/auth", authRoute);
// adminRoute.use("/staff", staffRoute);
// adminRoute.use("/adminData", adminDataRoute);
// adminRoute.use("/order", orderRoute);
// adminRoute.use("/userManage", userManageRoute);
// adminRoute.use("/dashBoard", dashBoardRoute);
// adminRoute.use("/image", imgRoute);
// adminRoute.use("/emailManagement", emailManagementRoute);

module.exports = adminRoute;
