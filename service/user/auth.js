const authModel = require("../../model/user.model");
const jwt = require("jsonwebtoken");
const { encrypt } = require("../../helper/encrypt-decrypt");
const bcrypt = require("bcrypt");
const otpModel = require("../../model/otp.model");
const path = require("path");
const userModel = require("../../model/user.model");
const { notification } = require("../../helper/notification");

require("dotenv").config({ path: path.join(__dirname, "../../config/.env") });

module.exports = {
  login: (email, password) => {
    return new Promise(async (res, rej) => {
      try {
        let logindata;
        console.log("email", typeof email);
        if (typeof email == "string") {
          logindata = await authModel.findOne(
            { email },
            {
              password: 1,
              firstName: 1,
              lastName: 1,
              mobile: 1,
              email: 1,
              verifiedStatus: 1,
              credit: 1,
              aadharCardFrontImg: 1,
              aadharCardBackImg: 1,
              panCardImg: 1,
              gstImg: 1,
              gstNo: 1,
              message: 1,
            }
          );
        } else {
          logindata = await authModel.findOne(
            { mobile: email },
            {
              password: 1,
              firstName: 1,
              lastName: 1,
              mobile: 1,
              email: 1,
              verifiedStatus: 1,
              credit: 1,
              aadharCardFrontImg: 1,
              aadharCardBackImg: 1,
              panCardImg: 1,
              gstImg: 1,
              gstNo: 1,
              message: 1,
            }
          );
        }
        // console.log("email", typeof email)
        // let logindata=await authModel.findOne({$or:[{email:email.toString()},{mobile:email}]},{password:1})
        // else{
        //     rej({ status: 500, error: err, message: "mobile/email and password are required for login!!" })
        // }
        if (logindata) {
          const isMatch = await bcrypt.compare(password, logindata.password);
          if (isMatch) {
            if (logindata.verifiedStatus == "approve") {
              console.log("verified status approve");
              let key1 = process.env.USER_ENCRYPTION_KEY;
              // console.log("logindata._id key1", logindata._id+" "+key1)
              let encryptUser = encrypt(logindata._id, key1);
              let encryptPass = encrypt(logindata.password, key1);
              let token = jwt.sign(
                { user_id: encryptUser, password: encryptPass },
                process.env.USER_ACCESS_TOKEN,
                { expiresIn: process.env.USER_ACCESS_TIME }
              );

              res({ status: 200, token: token });
            } else if (
              logindata.verifiedStatus == "pending" ||
              logindata.verifiedStatus == "reject"
            ) {
              console.log("verified status is pending");
              rej({
                status: 402,
                message: `your verify status is ${logindata.verifiedStatus}`,
                result: logindata,
              });
            }
          }
        } else {
          rej({
            status: 404,
            message: "You enetered invalid email or mobile!!",
          });
        }
      } catch (err) {
        rej({ status: 500, error: err });
      }
    });
  },

  register: (data) => {
    return new Promise(async (res, rej) => {
      try {
        let newAuthModel = new authModel(data);
        let savedata = await newAuthModel.save();
        if (savedata) {
          let notify = await notification(
            savedata._id,
            "registered successfully!!",
            "registered successsfully!!",
            "user"
          );
          res({ status: 200, data: "new user added" });
        } else {
          rej({ status: 500, message: "something went wrong!!" });
        }
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  sendOtp: (mobile, email) => {
    return new Promise(async (res, rej) => {
      try {
        var newOtpModel;
        let otp = Math.floor(100000 + Math.random() * 900000);
        if (email && mobile) {
          var newOtpModel = new otpModel({ mobile, email, otp });
        } else if (mobile) {
          var newOtpModel = new otpModel({ mobile, otp });
        } else {
          var newOtpModel = new otpModel({ email, otp });
        }
        let savedata = await newOtpModel.save();
        setTimeout(async () => {
          let deletedotp = await otpModel.findOneAndDelete({ otp: otp });
        }, 5 * 60 * 1000);
        if (savedata) {
          // console.log("saved data: ", savedata)
          res({ status: 200, data: otp });
        } else {
          rej({ status: 500, message: "something went wrong!!" });
        }
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  verifyOtp: (mobile, email, otp) => {
    //verify otp from otp model
    //if otp matched then remove that record from otp
    return new Promise(async (res, rej) => {
      try {
        let getData;
        if (mobile && email && otp) {
          getData = await otpModel.findOneAndDelete({ mobile, email, otp });
        } else if (mobile && otp && !email) {
          getData = await otpModel.findOneAndDelete({ mobile, otp });
        } else if (email && otp && !mobile) {
          getData = await otpModel.findOneAndDelete({ email, otp });
        }
        if (getData) {
          console.log(
            "mail is: ",
            email,
            "mobile is: ",
            process.env.USER_OTP_ACCESS_TIME
          );
          let token = jwt.sign({ mobile, email }, process.env.USER_OTP_TOKEN, {
            expiresIn: process.env.USER_OTP_ACCESS_TIME,
          });
          console.log("token...", token);
          res({ status: 200, token: token });
        } else {
          rej({ status: 404, message: "Invalid mobile  or email!!" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  forgotPassword: (mobile, email, password) => {
    return new Promise(async (res, rej) => {
      try {
        let updatePassword;
        password = await bcrypt.hash(password, 12);
        if (!email)
          updatePassword = await userModel.findOneAndUpdate(
            { mobile },
            { password },
            { new: true }
          );
        if (!mobile) {
          updatePassword = await userModel.findOneAndUpdate(
            { email },
            { password },
            { new: true }
          );
        }
        if (updatePassword) res({ status: 200, data: {} });
        else rej({ status: 404, message: "Invalid email or mobile number!!" });
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },
};
