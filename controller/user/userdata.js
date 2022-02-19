let service = require("../../service/user/userdata")
const { required } = require("joi")
let { response } = require("../../middleware/responsemiddleware")

exports.get = async (req, res) => {
    try {
        let resp = await service.get(req.userId)
        if (resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        else
            return response("Error..!!", {}, 500, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}