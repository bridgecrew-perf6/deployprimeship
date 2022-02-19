const { Schema, model } = require("mongoose")
let bcypt = require("bcrypt")

let address = new Schema({
	isDefault: {
		type: Boolean,
		default: false
	},
	// addressName: {
	// 	type: String
	// },
	country: {
		type: String,
		required: [true, "country is required"]
	},
	state: {
		type: String,
		required: [true, "state is required"]
	},
	city: {
		type: String,
		required: [true, "city is required"]

	},
	pincode: {
		type: String,
		required: [true, "pincode is necessary for deliver the prodcut"]
	},
	addressDescrption: {
		type: String,
		min: [1, "atleast have something"]
	},
})

const userSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		minLength: [1, "at least have one character as first name"],
		maxLength: [255, "name is too big right something small name"],
		required: true
	},
	lastName: {
		type: String,
		trim: true,
		minLength: [1, "at least have one character as first name"],
		maxLength: [255, "name is too big right something small name"],
		required: true
	},
	mobile: {
		type: Number,
		//regex of mobile
		match: [/^(\+\d{1,3}[- ]?)?\d{10}$/],
		required: true
	},
	password: {
		type: String,
		required: true
	},
	email: {
		type: String,
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
	},
	profileImage: {
		name: {
			type: String
		},
		url: {
			type: String
		}
	},
	proofImage: {
		name: {
			type: String
		},
		url: {
			type: String
		}
	},
	aadharCardFrontImg: {
		type: String
	},
	aadharCardBackImg: {
		type: String
	},
	panCardImg: {
		type: String
	},
	gstImg: {
		type: String
	},
	gstNo: {
		type: String
	},
	address: {
		type: address
	},
	isMobileVerified: {
		type: Boolean,
		default: false
	},
	isEmailVerified: {
		type: Boolean,
		default: false
	},
	verifiedStatus: {
		type: String,
		default: "pending",
		enum: ["pending", "reject", "approve"]
	},
	userStatus: {
		type: String,
		default: "active",
		enum: ["block", "active", "deactive"]
	},
	credit: {
		type: Number,
		default: 5000
	},
	isDeleted: {
		type: Boolean,
		default: false
	},
	bio: {
		type: String
	},
	isCheck: {
		type: Boolean,
		default: false
	},
	message: {
		type: String
	}
}, { timestamps: true })


userSchema.pre("save", async function (next) {
	if (this.isModified('password')) {
		this.password = await bcypt.hash(this.password, 12)
	}
})

// userSchema.pre("updateOne",async function(next){
// 	if (this.isModified('password')){
// 		this.password=await bcypt.hash(this.password,12)
// 	}
// })

userSchema.index({ firstName: 1, lastName: 1, mobile: 1, email: 1 })

module.exports = model("user", userSchema)





