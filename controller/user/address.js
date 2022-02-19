let service = require("../../service/user/address")
let { response } = require("../../middleware/responsemiddleware")

exports.add = async (req, res) => {
    try {
        let resp = await service.add(req.userId, req.body.address)
        if (resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        else
            return response("Error..!!", err.error, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.update = async (req, res) => {
    try {
        let resp = await service.update(req.userId, req.params.addressId, req.body.address)
        if (resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        else
            return response("Error..!!", err.error, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.delete = async (req, res) => {
    try {
        let resp = await service.delete(req.userId, req.params.addressId)
        if (resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        else
            return response("Error..!!", err.error, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}