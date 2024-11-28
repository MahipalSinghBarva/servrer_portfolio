const nodemailer = require("nodemailer");
const dotenv = require('dotenv');

dotenv.config();

exports.sendEmail = async (options) => {
    const transpoter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMPT_PORT,
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_EMAIL,
            pass: process.env.SMPT_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    await transpoter.sendMail(mailOptions);
};