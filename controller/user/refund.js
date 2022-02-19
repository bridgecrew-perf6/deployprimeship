let service = require("../../service/user/refund")
const { required } = require("joi")
let { response } = require("../../middleware/responsemiddleware")

exports.get = async (req, res) => {
    try {
        if (!req.query.page || !req.query.limit) {
            return response("pagination is require for pagination..!!", {}, 404, res)
        }
        else {
            let resp = await service.get(req.query?.str, req.query.page, req.query.limit, req.query.userId, req.query.paymentStatus)
            if (resp) {
                // console.log("resp.....", resp)
                return response("SUCCESS..!!", resp.data, 200, res)
            }
            else
                return response("Error..!!", err.error, err.status, res)
        }
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.insurance = async (req, res) => {
    try {
        if (!req.query.page || !req.query.limit) {
            return response("pagination is require for pagination..!!", {}, 404, res)
        }
        else {
            let resp = await service.insurance(req.userId, req.query.isRefund, req.query.page, req.query.limit)
            if (resp) {
                // console.log("resp.....", resp)
                return response("SUCCESS..!!", resp.data, 200, res)
            }
            else
                return response("Error..!!", err.error, err.status, res)
        }
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}
