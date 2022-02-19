let service = require("../../service/admin/userManage")
const { required } = require("joi")
let { response } = require("../../middleware/responsemiddleware")

exports.unVerified = async (req, res) => {
    try {
        console.log("req.userId", req.userId)
        if (!req.query.page || !req.query.limit) {
            return response("pagination is require for pagination..!!", {}, 404, res)
        }
        else {
            if (req.query.verifiedStatus == "approve") {
                res.send("Please enter valid verifiedStatus, pending or reject!!")
                // response(err.message, err?.error, err.status, res)
            }
            else {
                let resp = await service.unVerified(req.query?.str, req.query?.userStatus, req.query?.verifiedStatus, req.query.page, req.query.limit)
                if (resp) {
                    // console.log("resp.....", resp)
                    return response("SUCCESS..!!", resp.data, 200, res)
                }
                else
                    return response("Error..!!", err.error, err.status, res)
            }
        }
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.updateStatus = async (req, res) => {
    try {
        if (req.body.userStatus && (req.body.userStatus != "block" && req.body.userStatus != "active" && req.body.userStatus != "deactive")) {
            res.send("Please enter valid userStatus, active or block or deactive!!")
        }
        else if (req.body.verifiedStatus && req.body.verifiedStatus != "pending" && req.body.verifiedStatus != "reject" && req.body.verifiedStatus != "approve") {
            res.send("Please enter valid verifiedStatus, pending or reject or approve!!")
        }
        else {
            let resp = await service.updateStatus(req.query.userId, req.body.userStatus, req.body.verifiedStatus, req.query.message)
            if (resp) {
                // console.log("resp.....", resp)
                return response("SUCCESS..!!", {}, 200, res)
            }
            else
                return response("Error..!!", err.error, err.status, res)
        }
        // if (req.body.userStatus=="block"||req.body.userStatus=="active"||req.body.userStatus=="deactive") {
        //     let resp = await service.updateStatus(req.query.userId, req.body.userStatus, req.query.message)
        //     if (resp) {
        //         // console.log("resp.....", resp)
        //         return response("SUCCESS..!!", resp, 200, res)
        //     }
        //     else
        //         return response("Error..!!", err.error, err.status, res)
        // }
        // else {
        //     res.send("Please enter valid userStatus, active or block or deactive!!")
        //     // response(err.message, err?.error, err.status, res)
        // }
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.verify = async (req, res) => {
    try {
        if (!req.query.page || !req.query.limit) {
            return response("pagination is require for pagination..!!", {}, 404, res)
        }
        else {
            if (req.query.userStatus == "deactive") {
                res.send("Please enter valid userStatus, active or block!!")
                // response(err.message, err?.error, err.status, res)
            }
            else {
                let resp = await service.verify(req.query?.str, req.query?.userStatus, req.query.page, req.query.limit)
                if (resp) {
                    // console.log("resp.....", resp)
                    return response("SUCCESS..!!", resp.data, 200, res)
                }
                else
                    return response("Error..!!", err.error, err.status, res)
            }
        }
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.getProofImg = async (req, res) => {
    try {
        let resp = await service.getProofImg(req.query.userId)
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

exports.getPaymentData = async (req, res) => {
    try {
        if (!req.query.page || !req.query.limit) {
            return response("pagination is require for pagination..!!", {}, 404, res)
        }
        else {
            let resp = await service.getPaymentData(req.params._id, req.query.page, req.query.limit, req.query.transactionType)
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

exports.addCredit = async (req, res) => {
    try {
        if (req.body.credit && (req.body.paymentProofImg || req.body.paymentStatus)) {
            let resp = await service.addCredit(req.params._id, req.body.credit, req.body)
            if (resp) {
                // console.log("resp.....", resp)
                return response("SUCCESS..!!", resp.data, 200, res)
            }
            else
                return response("Error..!!", err.error, err.status, res)
        }
        else {
            response("only credit, paymentProofImg, paymentStatus can be updated", {}, 500, res)
        }
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.activeUser = async (req, res) => {
    try {
        if (req.body.paymentProofImg || req.body.paymentStatus) {
            let resp = await service.activeUser(req.params._id, req.body.paymentProofImg, req.body.paymentStatus)
            if (resp)
                return response("SUCCESS..!!", resp.data, 200, res)
            else
                return response("Error..!!", {}, 500, res)
        }
        else {
            response("only paymentProofImg, paymentStatus can be updated", {}, 500, res)
        }
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}