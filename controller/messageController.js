const { catchAsyncError } = require("../middleware/catchAAsyncError.js");
const { ErrorHandler } = require("../middleware/error.js");
const { Message } = require("../models/messageSchema.js");
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

exports.sendMessage = catchAsyncError(async (req, res, next) => {
    const { senderName, email, message } = req.body;

    if (!senderName || !email || !message) {
        return next(new ErrorHandler("Please Fill Full Form!", 400));
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER_EMAIL,
            pass: process.env.EMAIL_PASS_CODE,
        },
    });

    const mailOptions = {
        from: email,
        to: ["mahipalsingh450@gmail.com"],
        subject: `New message from ${senderName}`,
        text: message,
    };
    try {
        await transporter.sendMail(mailOptions);

        const data = await Message.create({ senderName, email, message });

        res.status(201).json({
            success: true,
            message: "Message sent successfully and saved to the database.",
            data,
        });
    } catch (error) {
        console.error("Error occurred:", error);
        return next(new ErrorHandler("Failed to send message. Please try again.", 500));
    }
});


exports.getAllMessage = catchAsyncError(async (req, res, next) => {
    const messages = await Message.find();
    res.status(200).json({
        success: true,
        messages,
    });
})

exports.deleteMessage = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    const message = await Message.findById(id)
    if (!message) {
        return (next(new ErrorHandler("Message already deleted", 400)))
    }
    await message.deleteOne()
    res.status(200).json({
        success: true,
        message: "Message deleted"
    })
})
