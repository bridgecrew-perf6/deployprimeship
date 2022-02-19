const adminModel = require("../../model/admin.model");
const mongoose = require("mongoose");

module.exports = {
  add: (data) => {
    return new Promise(async (res, rej) => {
      try {
        let newAdminModel = new adminModel(data);
        let savedata = await newAdminModel.save();
        if (savedata) {
          res({ status: 200, data: "new admin added" });
        } else {
          rej({ status: 500, message: "something went wrong!!" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  get: (str, status, page, limit) => {
    return new Promise(async (res, rej) => {
      try {
        page = parseInt(page);
        limit = parseInt(limit);
        let qry = { isDeleted: false };
        if (str) {
          qry["$or"] = [
            { firstName: { $regex: str, $options: "i" } },
            { lastName: { $regex: str, $options: "i" } },
            { email: { $regex: str, $options: "i" } },
            { role: { $regex: str, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: "$mobile" },
                  regex: str,
                },
              },
            },
          ];
        }
        if (status) {
          qry["status"] = status;
        }
        let getData = await adminModel.aggregate([
          { $match: qry },
          {
            $facet: {
              total_count: [
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              result: [
                {
                  $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    mobile: 1,
                    role: 1,
                    status: 1,
                    profileImg: 1,
                    isCheck: 1,
                  },
                },
                { $sort: { date: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
              ],
            },
          },
        ]);
        getData = getData[0];
        // console.log(getData)
        if (getData.result.length > 0) {
          let result = getData.result;
          let noTrack = [];
          let arr = [];
          for (let i = 0; i < result.length; i++) {
            if (!result[i].trackingNo) {
              noTrack.push(result[i]);
            } else {
              arr.push(result[i]);
            }
          }
          noTrack.push(...arr);
          res({
            status: 200,
            data: {
              total_count: getData.total_count[0].count,
              result: noTrack,
            },
          });
          // res({ status: 200, data: getData })
        } else {
          rej({ status: 404, message: "No Data found!!" });
        }
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  byId: (userId) => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await adminModel.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(userId) },
          },
          {
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              email: 1,
              mobile: 1,
              role: 1,
              status: 1,
              profileImg: 1,
              isCheck: 1,
              address: 1,
              password: 1,
            },
          },
        ]);
        if (getData) res({ status: 200, data: getData });
        else rej({ status: 500, message: "something went wrong!!" });
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  updateStatus: (userId, data) => {
    return new Promise(async (res, rej) => {
      try {
        let updateData = await adminModel.findByIdAndUpdate(
          userId,
          { $set: { status: data } },
          { new: true }
        );
        if (updateData) {
          res({ status: 200, data: updateData });
        } else {
          rej({ status: 404, message: "Invalid admin id!!" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  edit: (_id, data) => {
    return new Promise(async (res, rej) => {
      try {
        let editData = await adminModel.findByIdAndUpdate(_id, data, {
          new: true,
        });
        if (editData) {
          // res({ status: 200, data: "Data Updated!!" })
          res({ status: 200, data: editData });
        } else {
          rej({ status: 500, message: "something went wrong!!" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  delete: (userId) => {
    return new Promise(async (res, rej) => {
      try {
        let deleteData = await adminModel.findByIdAndUpdate(userId, {
          $set: { isDeleted: true },
        });
        if (deleteData) {
          res({ status: 200, data: "Data Updated!!" });
        } else {
          rej({ status: 500, message: "something went wrong!!" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },
};
