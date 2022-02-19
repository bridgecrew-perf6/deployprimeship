const jwt = require("jsonwebtoken")

exports.response = (msg, data, code, res) => {
    let obj = {}
    obj['data'] = data
    obj['message'] = msg
    return res.status(code).json(obj)
}