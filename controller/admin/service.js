let service = require("../../service/admin/service")
let { response } = require("../../middleware/responsemiddleware")

// exports.addCountry   = async (req, res) => {
//     try {
//         allCountryList = [
//             "Afghanistan", "Åland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas",
//             "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia (Plurinational State of)", "Bonaire, Sint Eustatius and Saba", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde",
//             "Cambodia", "Cameroon", "Canada", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo (the Democratic Republic of)", "Congo", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curaçao", "Cyprus", "Czechia", "Côte d'Ivoire", "Denmark",
//             "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Falkland Islands [Malvinas]", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon",
//             "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
//             "Heard Island and McDonald Islands", "Holy See", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan",
//             "Kenya", "Kiribati", "Korea (the Democratic People's Republic of)", "Korea (the Republic of)", "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao",
//             "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia (Federated States of)", "Moldova (the Republic of)", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia",
//             "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan",
//             "Palau", "Palestine, State of", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Republic of North Macedonia", "Romania", "Russian Federation", "Rwanda", "Réunion", "Saint Barthélemy",
//             "Saint Helena, Ascension and Tristan da Cunha", "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin (French part)", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten (Dutch part)", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan (Province of China)",
//             "Tajikistan", "Tanzania, United Republic of", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom of Great Britain and Northern Ireland", "United States Minor Outlying Islands", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu",
//             "Venezuela (Bolivarian Republic of)", "Viet Nam", "Virgin Islands (British)", "Virgin Islands (U.S.)", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"
//         ];

//         // let resp = await service.addCountry(req.body)
//         let resp = await service.addCountry(allCountryList)
//         if (resp)
//             return response("SUCCESS..!!", {}, 200, res)
//         else
//             return response("Error..!!", {}, err.status, res)
//     }
//     catch (err) {
//         return response(err.message, err?.error, err.status, res)
//     }
// }

exports.addService = async (req, res) => {
    try {
        let resp = await service.addService(req.body)
        if (resp)
            return response("SUCCESS..!!", {}, 200, res)
        else
            return response("Error..!!", err.error, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.get = async (req, res) => {
    try {
        let page = req.query.page
        let limit = req.query.limit
        if (!page || !limit) {
            return response("page and limit are require for pagination..!!", {}, 404, res)
        }
        else {
            let resp = await service.get(page, limit, req.query?.str)
            if (resp)
                return response("SUCCESS..!!", resp.data, 200, res)
            else
                return response("Error..!!", err.error, err.status, res)
        }
    }
    catch (err) {
        console.log("err", err)
        return response(err.message, err?.error, err.status, res)
    }
}

exports.byId = async (req, res) => {
    try {
        let resp = await service.byId(req.query.serviceId, req.query?.str)
        if (resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        else
            return response("Error..!!", err.error, err.status, res)
    }
    catch (err) {
        console.log("err", err)
        return response(err.message, err?.error, err.status, res)
    }
}

exports.edit = async (req, res) => {
    try {
        let resp = await service.edit(req.body)
        if (resp)
            return response("record updated successfully..!!!!", {}, 200, res)
        else
            return response("Error..!!", {}, 500, res)
    }
    catch (err) {
        console.log("err", err)
        return response(err.message, err?.error, err.status, res)
    }
}

exports.delete = async (req, res) => {
    try {
        let resp = await service.delete(req.query.serviceId)
        if (resp)
            return response("record deleted successfully..!!!!", {}, 200, res)
        else
            return response("Error..!!", {}, 500, res)
    }
    catch (err) {
        console.log("err", err)
        return response(err.message, err?.error, err.status, res)
    }
}

exports.addPriceChart = async (req, res) => {
    try {
        let resp = await service.addPriceChart(req.userId, req.body)
        if (resp)
            return response("price chart added successfully..!!", {}, 200, res)
        else
            return response("Error..!!", {}, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.deleteCountry = async (req, res) => {
    try {
        let resp = await service.deleteCountry(req.query.serviceId, req.query.countryId)
        if (resp)
            return response("SUCCESS..!!", {}, 200, res)
        else
            return response("Error..!!", {}, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.getPriceChart = async (req, res) => {
    try {
        // console.log("req.userId", req.userId)
        let resp = await service.getPriceChart(req.query.serviceId, req.query.countryId)
        if (resp) {
            // console.log("resp.....", resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        }
        else
            return response("Error..!!", {}, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.isData, err.status, res)
    }
}

exports.getServiceData = async (req, res) => {
    try {
        // console.log("req.userId", req.userId)
        let resp = await service.getServiceData(req.query._id)
        if (resp) {
            // console.log("resp.....", resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        }
        else
            return response("Error..!!", {}, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.editPriceChart = async (req, res) => {
    try {
        let resp = await service.editPriceChart(req.body)
        if (resp) {
            // console.log("resp.....", resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        }
        else
            return response("Error..!!", {}, err.status || 400, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status || 500, res)
    }
}