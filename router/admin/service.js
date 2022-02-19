const { Router } = require("express")
const serviceRoute = Router()
const serviceController = require("../../controller/admin/service")
const commonController = require("../../controller/common")

// const { verifyUserToken } = require("../../middleware/verifytoken")

// serviceRoute.get("/", (req,res)=>{
//     res.status(200).json({ message: "service get api route is working" })
// })

// serviceRoute.post("/addCountry", serviceController.addCountry)
serviceRoute.post("/addService", serviceController.addService)
serviceRoute.get("/", serviceController.get)
serviceRoute.get("/getCountry", commonController.getCountryList)
serviceRoute.get("/byId", serviceController.byId)
serviceRoute.put("/edit", serviceController.edit)
serviceRoute.delete("/delete", serviceController.delete)
serviceRoute.post("/addPriceChart", serviceController.addPriceChart)
serviceRoute.put("/deleteCountry", serviceController.deleteCountry)
serviceRoute.get("/getPriceChart", serviceController.getPriceChart)
serviceRoute.get("/getServiceData", serviceController.getServiceData)
serviceRoute.put("/editPriceChart", serviceController.editPriceChart)

// serviceRoute.put("/:addressId", verifyUserToken, addressController.update)
// serviceRoute.delete("/:addressId", verifyUserToken, addressController.delete)

module.exports = serviceRoute
