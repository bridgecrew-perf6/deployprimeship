
const countryModel = require("../../model/country.model")
const serviceModel = require("../../model/courierService.model")
const priceChartModel = require("../../model/pricechart.model")
const mongoose = require("mongoose")
const { promise } = require("bcrypt/promises")

module.exports = {
    // addCountry: (data) => {
    //     return new Promise(async (res, rej) => {
    //         try {
    //             let newCountryModel = new countryModel(data)
    //             let savedata = await newCountryModel.save()
    //             if (savedata) {
    //                 res({ status: 200, data: "new user added" })
    //             }
    //             else {
    //                 rej({ status: 500, message: "something went wrong!!" })
    //             }
    //         } catch (err) {
    //             rej({ status: 500, error: err, message: "something went wrong!!" })
    //         }
    //     })
    // },
    addService: (data) => {
        return new Promise(async (res, rej) => {
            try {
                let newServiceModel = new serviceModel(data)
                let savedata = await newServiceModel.save()
                if (savedata) {
                    res({ status: 200, data: "new user added" })
                }
                else {
                    rej({ status: 500, message: "something went wrong!!" })
                }
            } catch (err) {
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    get: (page, limit, str) => {
        return new Promise(async (res, rej) => {
            try {
                page = parseInt(page)
                limit = parseInt(limit)
                let qry = {}
                if (str) {
                    qry['name'] = { $regex: str, $options: 'i' }
                }
                let getData = await serviceModel.aggregate([
                    { $match: qry },
                    {
                        $facet: {
                            'total_count': [
                                {
                                    $group: {
                                        _id: null,
                                        'count': { $sum: 1 }
                                    }
                                }
                            ],
                            'result': [
                                {
                                    $project: {
                                        name: 1,
                                        image: 1,
                                        trackingURL:1,
                                    }
                                },
                                { $skip: (page - 1) * limit },
                                { $limit: limit }
                            ]
                        },
                    }
                ])
                if (getData) {
                    getData = getData[0]
                    if (getData.result.length>0){
                        res({ status: 200, data: { total_count: getData.total_count[0].count, result: getData.result } })
                    }
                    else{
                        rej({ status: 500, message: "No Data found!!" })
                    }
                }
                else {
                    rej({ status: 500, message: "something went wrong!!" })
                }
            }
            catch (err) {
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    byId: (serviceId, str) => {
        return new Promise(async (res, rej) => {
            try {
                let qry = {}
                if (str) {
                    qry['countryName'] = { $regex: str, $options: 'i' }
                }
                let getData = await serviceModel.aggregate([
                    {
                        $match: { _id: mongoose.Types.ObjectId(serviceId) }
                    },
                    {
                        $lookup: {
                            from: 'countries',
                            localField: 'countryId',
                            foreignField: '_id',
                            as: 'countryData'
                        }
                    },
                    { $unwind: '$countryData' },
                    {
                        $project: {
                            _id: 0,
                            name: 1,
                            image: 1,
                            countryName: '$countryData.name',
                            countryId: '$countryData._id'
                        }
                    },
                    { $match: qry }
                ])
                if (getData) {
                    res({ status: 200, data: getData })
                }
                else {
                    rej({ status: 500, message: "something went wrong!!" })
                }
            }
            catch (err) {
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    edit: (data) => {
        return new Promise(async (res, rej) => {
            try {
                let oldCountryList = await serviceModel.findById({ _id: data.serviceId }, { countryId: 1, _id: 0 })
                
                oldCountryList = oldCountryList.countryId

                let mergeArr = [...oldCountryList, ...data.countryId]
                let notInclude = mergeArr.filter(el => {
                    el = el.toString()
                    return !(oldCountryList.includes(el) && data.countryId.includes(el))
                })
                let updateData = await serviceModel.findByIdAndUpdate({ _id: data.serviceId }, { name: data.name, countryId: data.countryId, image: data.image, trackingURL: data.trackingURL }, { new: true })
                let delPriceChart = await priceChartModel.deleteMany({ serviceId: data.serviceId, countryId: notInclude })

                if (updateData && delPriceChart) {
                    res({ status: 200, data: {} })
                }
                else {
                    rej({ status: 404, message: "No data found!!" })
                }
            }
            catch (err) {
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    delete: (serviceId) => {
        return new Promise(async (res, rej) => {
            try {
                let delService = await serviceModel.findByIdAndDelete({ _id: serviceId })
                let delPriceChart = await priceChartModel.deleteMany({ serviceId: mongoose.Types.ObjectId(serviceId) })
                if (delService && delPriceChart) {
                    res({ status: 200, data: {} })
                }
                else {
                    rej({ status: 500, message: "Not deleted successfully!!" })
                }
            }
            catch (err) {
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    addPriceChart: (userId, data) => {
        return new Promise(async (res, rej) => {
            try {
                // data.adminId = userId
                console.log("data.priceChart.length", data.priceChart.length)
                let i
                for ( i = 0; i < data.priceChart.length;i++){
                    let obj={
                        'serviceId': data.serviceId,
                        'countryId': data.countryId,
                        'parcelGram': data.priceChart[i].parcelgm,
                        'price': data.priceChart[i].price,
                        'adminId': userId
                    }
                    let newPriceChartModel = new priceChartModel(obj)
                    let savedata = await newPriceChartModel.save()
                }
                if (i == data.priceChart.length) {
                    res({ status: 200, data: {} })
                }
                else {
                    rej({ status: 500, message: "something went wrong!!" })
                }
            } catch (err) {
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    deleteCountry: (serviceId, countryId) => {
        return new Promise(async (res, rej) => {
            try {
                let delService = await serviceModel.findByIdAndUpdate({ _id: serviceId }, { $pull: { countryId: countryId } }, { upsert: true })
                let delPriceChart = await priceChartModel.deleteMany({ serviceId: serviceId, countryId: countryId })
                if (delService && delPriceChart) {
                    res({ status: 200, data: {} })
                }
                else {
                    rej({ status: 500, message: "Not deleted successfully!!" })
                }
            } catch (err) {
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    getPriceChart: (serviceId, countryId) => {
        return new Promise(async (res, rej) => {
            try {
                let getData = await priceChartModel.aggregate([
                    {
                        $match: { serviceId: mongoose.Types.ObjectId(serviceId), countryId: mongoose.Types.ObjectId(countryId) }
                    },
                    {
                        $group:{
                            _id: { serviceId: '$serviceId', countryId:'$countryId'},
                            result:{$push:'$$ROOT'}
                            
                        }
                    }
                ])
                if (getData.length>0) {
                    getData=getData[0]
                    let i;
                    console.log("getData.result.length", getData.result.length)
                    for(i=0;i<getData.result.length;i++)
                    {
                        // getData.result[i].isData=true
                        delete getData.result[i].serviceId
                        delete getData.result[i].countryId
                        delete getData.result[i].isDeleted
                        delete getData.result[i].createdAt
                        delete getData.result[i].updatedAt
                        delete getData.result[i].__v
                      
                    }
                    // if (i == (getData.result.length-1))
                        res({ status: 200, data: { "serviceId": getData._id.serviceId, "countryId":getData._id.countryId, priceChart:getData.result,"isData":true} })
                }
                else {
                    rej({ status: 404, message:"No Data found!!", isData: false })
                    // rej({ status: 404, message: "Invalid serviceId or countryId id!!" })
                }
                // res(getData)
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    editPriceChart:(data)=>{
        return new Promise(async(res,rej)=>{
            try{
               let ediData = data.priceChart.map(item=>{
                    return new Promise(async(res,rej)=>{
                       
                        let getData = await priceChartModel.findByIdAndUpdate({ _id: item._id }, { 'parcelGram': item.parcelGram, 'price': item.price},{new:true})
                        if(getData)
                        {
                            res(getData)
                        }
                        else{
                            rej({ status: 500, error: {}, message: "something went wrong!!" })
                        }
                    })
                })
                Promise.all(ediData).then(result=>{
                    res({ status: 200, data:{} })
                })
                .catch((err)=>{
                    console.log("err...",err)
                    rej({ status: 500, error: {}, message: "something went wrong!!" })
                })
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    getServiceData: (_id) => {
        return new Promise(async (res, rej) => {
            try {
                let getData = await serviceModel.aggregate([
                    {
                        $match: { _id: mongoose.Types.ObjectId(_id) }
                    },
                    {
                        $project: {
                            _id: 1,
                            name:1,
                            countryId:1,
                            image:1,
                            trackingURL:1
                        }
                    }
                ])
                if (getData) {
                    res({ status: 200, data: getData })
                }
                else {
                    rej({ status: 404, message: "Invalid service id!!" })
                }
                // res(getData)
            }
            catch (err) {
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },
    
}