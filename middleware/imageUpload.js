const multer = require("multer")
// console.log("in middleware")
let storageMulter = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './upload')
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
})
// console.log("storageMulter:", storageMulter)
exports.upload = multer({ storage: storageMulter })