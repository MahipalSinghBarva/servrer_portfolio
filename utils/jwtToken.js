const dotenv = require('dotenv');
const jwt = require("jsonwebtoken");

dotenv.config();

exports.generateToken = (user, message, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, SEDFGHJNNHGF, {
        expiresIn: 7,
    });


    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    res.status(statusCode).cookie("token", token, cookieOptions).json({
        success: true,
        message,
        token,
        user,
    });
};