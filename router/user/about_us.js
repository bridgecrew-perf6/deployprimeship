const { Router } = require("express")
const aboutUsRoute = Router()
const commonController = require("../../controller/common")

// const { verifyUserToken } = require("../../middleware/verifytoken")

aboutUsRoute.get("/", commonController.getAboutUs)

module.exports = aboutUsRoute