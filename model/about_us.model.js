const { string } = require("joi")
const { Schema, model } = require("mongoose")



let aboutUsSchema = new Schema({
    headerLogo:{
        type: String
    },
    bannerImage: {
        type: String
    },
    whyChooseUs: [
        {
            image: {
                type: String
            },
            title: {
                type: String,
            },
            description: {
                type: String,
            }
        }
    ],
    ourServices: [{
        image:{
            type:String
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        }
    }],
    insurance: {
        image: {
            type: String
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        }
    },
    whyUs: {
        image: {
            type: String
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        }
    },
    copyRight:{
        type:String
    }
}, { timestamps: true })

module.exports = model("about_us", aboutUsSchema)