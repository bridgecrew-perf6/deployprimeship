let service = require("../../service/admin/about_us")
const { required } = require("joi")
let { response } = require("../../middleware/responsemiddleware")

exports.add = async (req, res) => {
    try {
        console.log("in controller.....")
        let resp = await service.add(req.body)
        if (resp)
            return response("SUCCESS..!!", {}, 200, res)
        else
            return response("Error..!!", err.error, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.edit = async (req, res) => {
    try {
        let resp = await service.edit(req.body)
        if (resp)
            return response("SUCCESS..!!", {}, 200, res)
        else
            return response("Error..!!", err.error, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}