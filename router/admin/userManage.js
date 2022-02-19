const { Router } = require("express")
const userManageRoute = Router()
const userManageController = require("../../controller/admin/userManage")
const { verifyAdminToken, verifyUserToken } = require("../../middleware/verifytoken")

userManageRoute.get("/", (req, res) => {
    res.status(200).json({ message: "userManagement get api route is working" })
})

userManageRoute.get("/unVerified",  userManageController.unVerified)
userManageRoute.put("/updateStatus",  userManageController.updateStatus)
userManageRoute.get("/verify",  userManageController.verify)
userManageRoute.get("/getProofImg",  userManageController.getProofImg)
userManageRoute.get("/getPaymentData/:_id",  userManageController.getPaymentData)
userManageRoute.put("/addCredit/:_id",  userManageController.addCredit)
userManageRoute.put("/activeUser/:_id",  userManageController.activeUser)

module.exports = userManageRoute