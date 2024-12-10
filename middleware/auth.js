const { User } = require("../models/userSchema.js");
const { catchAsyncError } = require("../middleware/catchAAsyncError.js");
const ErrorHandler = require("../middleware/error.js");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
    console.log(req.cookies, "COOKIES");
    
    const { token } = req.cookies;
    console.log(token, "TOKEN");
    console.log(process.env.JWT_SECRET_KEY, "KEY");

    if (!token) {
        return next(new ErrorHandler("User not authenticated", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return next(new ErrorHandler("Invalid or expired token", 401));
    }
});
