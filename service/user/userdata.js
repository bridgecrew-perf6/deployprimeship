const userModel = require("../../model/user.model")
const mongoose = require("mongoose")

module.exports = {
    
    get: (_id) => {
        return new Promise(async (res, rej) => {
            try {
                let getData = await userModel.findById({ _id }, { _id: 1, firstName: 1, lastName: 1, verifiedStatus: 1, profileImage: '$profileImage', email: 1, mobile: 1, city: '$address.city', state: '$address.state', country: '$address.country', Wallet_amount: '$credit' })
                if (getData) {
                    res({ status: 200, data: getData })
                }
                else {
                    rej({ status: 404, message: "Invalid user id!!" })
                }
                // res(getData)
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },
}
