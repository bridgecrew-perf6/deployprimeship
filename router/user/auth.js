const { Router } = require("express")
const authRoute = Router()
const userAuthController = require("../../controller/user/auth")
const { validateSchema, userSchema, mobileCheck, veryfyMobileRegi } = require("../../middleware/validation")
const { verifyOtpToken } = require("../../middleware/verifytoken")

authRoute.post("/login", userAuthController.login)
authRoute.post("/register", mobileCheck, validateSchema(userSchema), userAuthController.register)

authRoute.post("/sendOtp", veryfyMobileRegi, userAuthController.sendOtp)
// authRoute.post("/sendOtpForgot", veryfyMobileRegi, userAuthController.sendOtp)

authRoute.post("/verifyOtp", userAuthController.verifyOtp)

//Honey 21-01
authRoute.put("/forgotPassword", userAuthController.forgotPassword)

module.exports = authRoute