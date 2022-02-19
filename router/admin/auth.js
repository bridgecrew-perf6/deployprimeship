const { Router } = require("express")
const authRoute = Router()
const adminAuthController = require("../../controller/admin/auth")
const { verifyAdminToken } = require("../../middleware/verifytoken")

authRoute.get("/", (req, res) => {
    res.status(200).json({ message: "auth get api route is working" })
})

authRoute.post("/login", adminAuthController.login)

module.exports = authRoute