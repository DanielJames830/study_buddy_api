const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		lowercase: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error("Email is invalid.");
			}
		},
	},
	username: {
		type: String,
		required: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minLength: 8,
	},
	school: {
		type: String,
		required: true,
	},
	email_verified: {
		type: Boolean,
		default: false,
	},
	ig_username: {
		type: String,
		default: false,
	},
	ig_password: {
		type: String,
		trim: true,
		minLength: 8,
		default: false,
	},
	majors: [String],
	notifications: {type: [Schema.Types.ObjectId], ref: 'Notification', default: []},
	tokens: [String],
	profile_pic: Buffer,
});

userSchema.pre('save', async function(next) {
  
  const user = this
  
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  
  next()  // run the save() method
})

userSchema.statics.findByCredentials = async function (email, password) {
	const user = await User.findOne({ email });
	 if (!user) {
		 throw new Error("Unable to login");
	 }
	 const isMatch = await bcrypt.compare(password, user.password);
	 if (!isMatch) {
		 throw new Error("Unable to login - no match");
	 }
	 return user;
 };

userSchema.methods.toJSON = function () {
	const user = this;

	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;
	delete userObject.email_verified;
	delete userObject.__v;

	return userObject;
};

userSchema.methods.generateAuthToken = async function () {
	const user = this
   
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JSON_WEB_TOKEN_SECRET)
  
	user.tokens = user.tokens.concat(token)
	await user.save()
  
	return token
  }

  userSchema.index({ username: 'text',  });

const User = mongoose.model("User", userSchema);

module.exports = User;
