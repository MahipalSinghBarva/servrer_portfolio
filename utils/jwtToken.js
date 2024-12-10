const dotenv = require('dotenv');
const jwt = require("jsonwebtoken");

dotenv.config();

exports.generateToken = (user, message, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
    console.log("token generated", token);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    res.status(statusCode).cookie("token", token, cookieOptions).json({
        success: true,
        message,
        token,
        user,
    });
};