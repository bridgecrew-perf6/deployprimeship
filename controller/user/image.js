let imgService = require("../../service/user/image")
let { response } = require("../../middleware/responsemiddleware")

exports.get = async (req, res) => {
    try {
        let resp = await imgService.get(req.params.userId)
        if (resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        else
            return response("Error..!!", {}, 500, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}
