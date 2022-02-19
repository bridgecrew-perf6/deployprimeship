const { Router } = require("express")
const inquiryRoute = Router()
const inquiryController = require("../../controller/user/inquiry")
// const { verifyUserToken } = require("../../middleware/verifytoken")

inquiryRoute.post("/", inquiryController.add)

module.exports = inquiryRoute