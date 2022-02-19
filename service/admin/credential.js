const adminModel = require("../../model/admin.model");

module.exports = {
  updateService: (data) => {
    return new Promise(async (res, rej) => {
      try {
        let updateData = await adminModel.updateMany(
          { role: "staff" },
          { service: data },
          { new: true }
        );
        if (updateData) {
          res({ status: 200, data: {} });
        } else {
          rej({ status: 500, message: "something went wrong!!" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },
  getService: (userId) => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await adminModel.findOne(
          { role: "staff" },
          { service: 1 }
        );
        if (getData) res({ status: 200, data: getData.service });
        else rej({ status: 500, message: "something went wrong" });
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },
};
