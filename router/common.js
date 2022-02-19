const { Router } = require("express")
const commonRoute = Router()
const commonController = require("../controller/common")

commonRoute.get("/getCountry", commonController.getCountryList)
module.exports = commonRoute