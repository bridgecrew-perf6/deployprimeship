
const userModel = require("../../model/user.model")

module.exports = {
    
    add: (_id, data) => {
        return new Promise(async (res, rej) => {
            try {
                console.log("data.....", data)
                let addData = await userModel.findByIdAndUpdate(_id, { $addToSet: { address: data } }, { new: true })
                if (addData)
                    res({ status: 200, data: "address added!!" })
                else
                    rej({ status: 500, message: "something went wrong!!" })
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    update: (_id, addressId, updatedAddress) => {
        return new Promise(async (res, rej) => {
            try {
                let updateData = await userModel.findOneAndUpdate({ _id: _id, 'address._id': addressId }, { $set: { 'address.$': updatedAddress } }, { upsert: true })
                if (updateData)
                    res({ status: 200, data: "Address Updated!!" })
                else
                    rej({ status: 500, message: "something went wrong!!111" })
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!222" })
            }
        })
    },

    delete: (_id, addressId) => {
        return new Promise(async (res, rej) => {
            try {
                let deleteData = await userModel.findOneAndUpdate({ _id: _id, 'address._id': addressId }, { $pull: { 'address': { _id: addressId } } }, { new: true })
                if (deleteData)
                    res({ status: 200, data: "Address Deleted!!" })
                else
                    rej({ status: 500, error: err, message: "something went wrong!!111" })
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!222" })
            }
        })
    }
}
