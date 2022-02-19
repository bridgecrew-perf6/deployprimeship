const userModel = require("../../model/user.model");
// const middleUpload = require("../../middleware/imageupload")
// const multer = require("multer")
// const { initializeApp, cert } = require("firebase-admin/app")
// const { getStorage } = require("firebase-admin/storage")
// const serviceAccount = require("../../helper/firebase.json")
// const { v4: uuidv4 } = require("uuid")
// const fs = require("fs")

// //firebase configuration
// initializeApp({
//     credential: cert(serviceAccount)
// })
// const bucket = getStorage().bucket('gs://image-upload-nodejs-f3674.appspot.com')

module.exports = {
  get: (userid) => {
    return new Promise(async (res, rej) => {
      try {
        let getImg = await userModel.findById(
          { _id: userid },
          { profileImage: 1, _id: 0 }
        );
        console.log("getImg", getImg);
        if (getImg) {
          res({ status: 200, data: getImg });
        } else {
          rej({ status: 404, message: "No data found or invalid userid!!" });
        }
      } catch (err) {
        rej({ status: 500, error: err });
      }
    });
  },
  // upload: (image) => {
  //     return new Promise(async (res, rej) => {
  //         try {
  //             //firebase logic to upload the image

  //             let uploaded = bucket.upload(image.path, {
  //                 public: true,
  //                 destination: `images/${(Math.random() * 10000) + image.filename}`,
  //                 metadata: {
  //                     firebaseStorageDownloadTokens: uuidv4(),
  //                 }
  //             })
  //             let data = await uploaded
  //             if (data) {
  //                 fs.unlinkSync(image.path)
  //                 res({ status: 200, data: { "mediaLink": data[0].metadata.mediaLink, "name": data[0].metadata.name } })
  //             }
  //         }
  //         catch (err) {
  //             console.log("error..", err)
  //             rej({ status: 500, error: err })
  //         }
  //     })
  // },

  // delete: (image) => {
  //     return new Promise(async (res, rej) => {
  //         try {
  //             const deleted = await bucket.file(image).delete()
  //             if (deleted) {
  //                 res({ status: 200, data: "image deleted Successfully !!" })
  //             }
  //             else {
  //                 rej({ status: 500, error: err })
  //             }
  //         }
  //         catch (err) {
  //             console.log("err/...", err)
  //             rej({ status: 500, error: err })
  //         }
  //     })
  // }
};
