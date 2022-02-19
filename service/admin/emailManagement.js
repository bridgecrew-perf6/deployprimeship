const mongoose = require("mongoose")
const { response } = require("../../middleware/responsemiddleware")
const inquiryModel = require("../../model/inquiry.model")

module.exports = {
    
    inquiry: (page, limit) => {
        return new Promise(async (res, rej) => {
            try {
                page = parseInt(page)
                limit = parseInt(limit)
                let getData = await inquiryModel.aggregate([
                    {
                        $facet: {
                            total_count: [
                                {
                                    $group: {
                                        _id: null,
                                        count: { $sum: 1 }
                                    }
                                }
                            ],
                            result: [
                                {
                                    $project: {
                                        _id: 1,
                                        firstName: 1,
                                        lastName: 1,
                                        email: 1,
                                        message: 1,
                                        createdAt:1
                                    }
                                },
                                { $sort: { createdAt: -1 } },
                                { $skip: (page - 1) * limit },
                                { $limit: limit }
                            ]
                        }
                    }
                ])
                getData = getData[0]
                if (getData.result.length > 0) {
                    res({ status: 200, data: { total_count: getData.total_count[0].count, result: getData.result } })
                }
                else {
                    rej({ status: 404, message: "No data found!!" })
                }
                // res(getData)
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    view: (_id) => {
        return new Promise(async (res, rej) => {
            try {
                let getData = await inquiryModel.aggregate([
                    {
                        $match: { _id: mongoose.Types.ObjectId(_id) }
                    },
                    {
                        $project: {
                            _id: 1,
                            firstName: 1,
                            lastName: 1,
                            email: 1,
                            message: 1,
                            image:1,
                            mobile:1,
                            createdAt:1
                        }
                    }
                ])
                if (getData) {
                    res({ status: 200, data: getData })
                }
                else {
                    rej({ status: 404, message: "Invalid id!!" })
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