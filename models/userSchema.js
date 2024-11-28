const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto")


const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Name Required"],
  },
  email: {
    type: String,
    required: [true, "Email Required"],
    unique: true,
  },
  phone: {
    type: String,
    required: [true, "Mobile Number Required"],
  },
  aboutMe: {
    type: String,
    required: [true, "About me field Required"],
  },
  password: {
    type: String,
    required: [true, "Password Required"],
    minLength: [8, "Password must contain at least 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  resume: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  portfolioURL: {
    type: String,
    required: [true, "Portfolio URL required"],
  },
  githubURL: String,
  instagram: String,
  linkedIn: String,
  twitterURL: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Password hashing middleware before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT
// userSchema.methods.generatejsonWebToken = function () {
//   return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
//     expiresIn: process.env.JWT_EXPIRE,
//   });
// };

// Method to generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

module.exports.User = mongoose.model("User", userSchema);

