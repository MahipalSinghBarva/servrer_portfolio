const { User } = require("../models/userSchema.js");
const { catchAsyncError } = require("../middleware/catchAAsyncError.js");
const ErrorHandler = require("../middleware/error.js");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

dotenv.config();

const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("User not authenticated", 401));
    }
    console.log("Token from cookies:", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id);
        console.log("user auth", req.user);
        console.log(process.env.JWT_SECRET_KEY)
        if (!req.user) {
            return next(new ErrorHandler("User not authenticated", 401));
        }
        next();
    } catch (err) {
        return next(new ErrorHandler("Invalid or expired token", 401));
    }
});
module.exports.isAuthenticated = isAuthenticated