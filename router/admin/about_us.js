const { Router } = require("express")
const aboutUsRoute = Router()
const aboutUsController = require("../../controller/admin/about_us")
const commonController = require("../../controller/common")
// const { verifyUserToken } = require("../../middleware/verifytoken")

// aboutUsRoute.get("/", (req, res) => {
//     res.status(200).json({ message: "aboutUs get api route is working" })
// })

aboutUsRoute.post("/add", aboutUsController.add)
aboutUsRoute.get("/", commonController.getAboutUs)
aboutUsRoute.put("/edit", aboutUsController.edit)

module.exports = aboutUsRoute
