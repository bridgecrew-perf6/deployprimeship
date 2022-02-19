let service = require("../../service/admin/adminData")
const { required } = require("joi")
let { response } = require("../../middleware/responsemiddleware")

exports.get = async (req, res) => {
    try {
        console.log("req.userId", req.userId)
        let resp = await service.get(req.userId)
        if (resp) {
            // console.log("resp.....", resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        }
        else
            return response("Error..!!", err.error, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.update = async (req, res) => {
    try {
        if (req.body.firstName || req.body.lastName || req.body.profileImg) {
            let resp = await service.update(req.params._id, req.body)
            if (resp)
                return response("SUCCESS..!!", resp.data, 200, res)
            else
                return response("Error..!!", err.error, err.status, res)
        }
        else {
            res.send("You can only update firstName, lastName and profileImg.")
            // response("You can only update firstName, lastName and profileImg.....", err.error, err.status, res)
        }
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.sendNotification = async (req, res) => {
    try {
        if (req.body.message) {
            console.log("req.userId.........", req.userId)
            let resp = await service.sendNotification(req.userId, req.body.message)
            if (resp) {
                // console.log("resp.....", resp)
                return response("SUCCESS..!!", resp.data, 200, res)
            }
            else
                return response("Error..!!", err.error, err.status, res)
        }
        else {
            res.send("You can only add message.....")
            // response("You can only add message.....", err.error, err.status, res)
        }
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}