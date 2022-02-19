const jwt = require("jsonwebtoken");
const { decrypt } = require("../helper/encrypt-decrypt");
const path = require("path");
const userModel = require("../model/user.model");
const adminModel = require("../model/admin.model");
const { connectStorageEmulator } = require("@firebase/storage");

require("dotenv").config({ path: path.join(__dirname, "../config/.env") });

function verifyUserToken(req, res, next) {
  let token = req.headers["authorization"];
  if (!token) {
    res.status(403).json({ success: false, message: "token missing" });
  } else {
    token = token.split(" ")[1];
    jwt.verify(token, process.env.USER_ACCESS_TOKEN, (err, payload) => {
      if (err) {
        res.status(403).json({ success: false, message: "unauthorized token" });
      } else {
        req.userId = decrypt(payload.user_id, process.env.USER_ENCRYPTION_KEY);
        req.password = decrypt(
          payload.password,
          process.env.USER_ENCRYPTION_KEY
        );
        next();
      }
    });
  }
}

// function verifyAdminToken(req, res, next) {
//   let token = req.headers["authorization"];
//   if (!token) {
//     res.status(403).json({ success: false, message: "token missing" });
//   } else {
//     token = token.split(" ")[1];
//     jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN, (err, payload) => {
//       if (err) {
//         res.status(403).json({ success: false, message: "unauthorized token" });
//       } else {
//         req.userId = decrypt(
//           payload.Admin_id,
//           process.env.ADMIN_ENCRYPTION_KEY
//         );
//         req.password = decrypt(
//           payload.password,
//           process.env.ADMIN_ENCRYPTION_KEY
//         );

//         next();
//       }
//     });
//   }
// }

// function verifyAdminToken(index) {
//   //   console.log("index...", index);
//   return (req, res, next) => {
//     let token = req.headers["authorization"];
//     if (!token) {
//       res.status(403).json({ success: false, message: "token missing" });
//     } else {
//       //   console.log("token", token);
//       allowPos = token.indexOf("allow");
//       allowPos = allowPos + 5;
//       let allowarr = [
//         allowPos,
//         allowPos + 2,
//         allowPos + 4,
//         allowPos + 6,
//         allowPos + 8,
//         allowPos + 10,
//         allowPos + 12,
//         allowPos + 14,
//         allowPos + 16,
//         allowPos + 18,
//       ];
//       //   console.log("allowPos", allowPos);
//       //   console.log("allowarr[index - 1]", allowarr[index - 1]);
//       let substr;
//       if (index < 10) {
//         substr = token.substring(allowarr[index - 1], allowarr[index - 1] + 1);
//       } else {
//         substr = token.substring(allowarr[index - 1], allowarr[index - 1] + 2);
//       }
//       console.log("substr index", substr + "  " + index);

//       if (substr == index) {
//         token = token.split(" ")[1];

//         jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN, (err, payload) => {
//           if (err) {
//             res
//               .status(403)
//               .json({ success: false, message: "unauthorized token" });
//           } else {
//             req.userId = decrypt(
//               payload.Admin_id,
//               process.env.ADMIN_ENCRYPTION_KEY
//             );
//             req.password = decrypt(
//               payload.password,
//               process.env.ADMIN_ENCRYPTION_KEY
//             );
//             next();
//           }
//         });
//       } else {
//         res.status(403).json({
//           success: false,
//           message: "You are not  authorized to do operation. contact admin!!",
//         });
//       }
//     }
//   };
// }

function verifyAdminToken(index) {
  //   console.log("index...", index);
  return (req, res, next) => {
    let token = req.headers["authorization"];
    if (!token) {
      res.status(403).json({ success: false, message: "token missing" });
    } else {
      token = token.split(" ")[1];
      jwt.verify(
        token,
        process.env.ADMIN_ACCESS_TOKEN,
        async (err, payload) => {
          if (err) {
            res
              .status(403)
              .json({ success: false, message: "unauthorized token" });
          } else {
            req.userId = decrypt(
              payload.Admin_id,
              process.env.ADMIN_ENCRYPTION_KEY
            );
            req.password = decrypt(
              payload.password,
              process.env.ADMIN_ENCRYPTION_KEY
            );
            let loginData = await adminModel.findOne({
              _id: req.userId,
              password: req.password,
            });

            if (loginData) {
              // console.log("login data...", loginData);.
              req.permission = loginData.service;
              if (req.permission[index - 1] == index) next();
              else {
                res.status(403).json({
                  success: false,
                  message:
                    "you are not authorized to do work. please contact admin!!",
                });
              }
            } else {
              res.status(403).json({
                success: false,
                message: "your password may change!! please login again",
              });
            }
          }
        }
      );
    }
  };
}

function verifySuperAdminToken(req, res, next) {
  let token = req.headers["authorization"];
  if (!token) {
    res.status(403).json({ success: false, message: "token missing" });
  } else {
    token = token.split(" ")[1];
    jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN, async (err, payload) => {
      if (err) {
        res.status(403).json({ success: false, message: "unauthorized token" });
      } else {
        req.userId = decrypt(
          payload.Admin_id,
          process.env.ADMIN_ENCRYPTION_KEY
        );
        req.password = decrypt(
          payload.password,
          process.env.ADMIN_ENCRYPTION_KEY
        );
        console.log("req.userId ....", req.userId);
        let isSuper = await adminModel.findOne({ _id: req.userId });
        if (isSuper.role == "superAdmin") next();
        else
          res.status(403).json({
            success: false,
            message: "only super admin can change credential..!!",
          });
      }
    });
  }
}

function verifyStaffToken(req, res, next) {
  let token = req.headers["authorization"];
  if (!token) {
    res.status(403).json({ success: false, message: "token missing" });
  } else {
    token = token.split(" ")[1];
    jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN, async (err, payload) => {
      if (err) {
        res.status(403).json({ success: false, message: "unauthorized token" });
      } else {
        req.userId = decrypt(
          payload.Admin_id,
          process.env.ADMIN_ENCRYPTION_KEY
        );
        req.password = decrypt(
          payload.password,
          process.env.ADMIN_ENCRYPTION_KEY
        );
        console.log("req.userId ....", req.userId);
        next();
      }
    });
  }
}
// function verifySuperAdminToken(req, res, next) {
//   let token = req.headers["authorization"];
//   if (!token) {
//     res.status(403).json({ success: false, message: "token missing" });
//   } else {
//     token = token.split(" ")[1];
//     jwt.verify(token, process.env.SUPERADMIN_ACCESS_TOKEN, (err, payload) => {
//       if (err) {
//         res.status(403).json({ success: false, message: "unauthorized token" });
//       } else {
//         req.userId = decrypt(
//           payload.Admin_id,
//           process.env.SUPERADMIN_ENCRYPTION_KEY
//         );
//         req.password = decrypt(
//           payload.password,
//           process.env.SUPERADMIN_ENCRYPTION_KEY
//         );
//         console.log("login fdata...", req.userId + " " + req.password);
//         next();
//       }
//     });
//   }
// }

function verifyOtpToken(token) {
  return new Promise(async (resolve, reject) => {
    console.log("TPLLLL: ", process.env.USER_OTP_TOKEN);
    if (!token) {
      reject({ message: "token missing", status: 401 });
    } else {
      jwt.verify(token, process.env.USER_OTP_TOKEN, (err, payload) => {
        if (err) {
          console.log("error is: ", err);
          reject({ message: "unauthorized token", status: 401 });
        } else {
          console.log("payload is: ", payload);
          resolve(payload);
        }
      });
    }
  });
}

module.exports = {
  verifyUserToken,
  verifyOtpToken,
  verifyAdminToken,
  verifySuperAdminToken,
  verifyStaffToken,
};
