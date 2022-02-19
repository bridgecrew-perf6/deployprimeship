const { Router } = require("express")
const subscribeRoute = Router()
const subscribeController = require("../../controller/user/subscriber")
// const { verifyUserToken } = require("../../middleware/verifytoken")

subscribeRoute.post("/add", subscribeController.add)

module.exports = subscribeRoute