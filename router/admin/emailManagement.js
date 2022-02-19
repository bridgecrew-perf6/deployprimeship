const { Router } = require("express")
const emailManagementRoute = Router()
const emailManagementController = require("../../controller/admin/emailManagement")
const { verifyAdminToken } = require("../../middleware/verifytoken")

emailManagementRoute.get("/", (req, res) => {
    res.status(200).json({ message: "emailManagement get api route is working" })
})

emailManagementRoute.get("/inquiry",emailManagementController.inquiry)
emailManagementRoute.get("/view/:_id",emailManagementController.view)

module.exports = emailManagementRoute