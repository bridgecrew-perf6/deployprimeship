let service = require("../../service/user/inquiry")
const { required } = require("joi")
let { response } = require("../../middleware/responsemiddleware")

exports.add = async (req, res) => {
    try {
        let resp = await service.add(req.body)
        if (resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        else
            return response("Error..!!", err.error, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}