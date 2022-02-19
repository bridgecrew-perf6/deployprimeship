// const controller = require("../../controller/user/image")
const commonController = require("../../controller/common")
const controller = require("../../controller/admin/image")
let { Router } = require("express")
const imgRoute = Router()
const { upload } = require("../../middleware/imageUpload")

//Honey 19-01-2022
// imgRoute.get("/:userId", controller.get)
imgRoute.post("/upload", upload.single("img"), commonController.upload)
imgRoute.delete("/delete", commonController.delete)

module.exports = imgRoute