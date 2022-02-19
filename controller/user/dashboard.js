let service = require("../../service/user/dashBoard")
let { response } = require("../../middleware/responsemiddleware")

exports.get = async (req, res) => {
    try {
        let resp = await service.get(req.userId)
        if (resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        else
            return response("Error..!!", err.error, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.notification = async (req, res) => {
    try {
        if (!req.query.page || !req.query.limit) {
            return response("pagination is require for pagination..!!", {}, 404, res)
        }
        else {
            let resp = await service.notification(req.userId, req.query.page, req.query.limit, req.query.type)
            if (resp)
                return response("SUCCESS..!!", resp.data, 200, res)
            else
                return response("Error..!!", {}, 500, res)
        }
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}