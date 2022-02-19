const adminModel = require("../../model/user.model")
const middleUpload = require("../../middleware/imageupload")
const multer = require("multer")
const { initializeApp, cert } = require("firebase-admin/app")
const { getStorage } = require("firebase-admin/storage")
const serviceAccount = require("../../helper/firebase.json")
const { v4: uuidv4 } = require("uuid")
const fs = require("fs")

//firebase configuration
initializeApp({
    credential: cert(serviceAccount)
})
const bucket = getStorage().bucket('gs://image-upload-nodejs-f3674.appspot.com')

module.exports = {
    
    get: (userid) => {
        return new Promise(async (res, rej) => {
            try {
                let getImg = await adminModel.findById(userid, { profileImage: 1, _id: 0 })
                if (getImg) {
                    res({ status: 200, data: getImg })
                }
                else {
                    rej({ status: 404, message: "No data found or invalid userid!!" })
                }
            }
            catch (err) {
                rej({ status: 500, error: err })
            }
        })
    },
}