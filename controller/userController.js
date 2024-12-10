const { User } = require("../models/userSchema.js");
const { generateToken } = require("../utils/jwtToken.js");
const { catchAsyncError } = require("../middleware/catchAAsyncError.js");
const { ErrorHandler } = require("../middleware/error.js");
const { s3 } = require("../middleware/s3.js")
const { sendEmail } = require("../utils/sendEmail.js")

const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
const crypto = require("crypto")


dotenv.config();

exports.register = catchAsyncError(async (req, res, next) => {
    const {
        fullName,
        email,
        password,
        confirmPassword,
        aboutMe,
        phone,
        portfolioURL,
        githubURL,
        instagram,
        linkedIn,
        twitterURL
    } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !aboutMe || !phone || !portfolioURL) {
        return next(new ErrorHandler("All fields are required!:" + err.message, 400))
    }

    if (password !== confirmPassword) {
        return next(new ErrorHandler("Password should be same:" + err.message, 400))
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler("User with this email already exists", 400));
    }

    const profileImage = req.files && req.files.profileImage ? req.files.profileImage[0] : null;
    const resumeFile = req.files && req.files.resume ? req.files.resume[0] : null;

    const user = new User({
        fullName,
        email,
        password,
        aboutMe,
        phone,
        portfolioURL,
        avatar: profileImage ? {
            public_id: profileImage.key,
            url: profileImage.location,
        } : null,
        resume: resumeFile ? {
            public_id: resumeFile.key,
            url: resumeFile.location,
        } : null,
        githubURL,
        instagram,
        linkedIn,
        twitterURL
    });

    await user.save();

    generateToken(user, "Registered successfully", 201, res)
});

exports.login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Provide Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 404));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    generateToken(user, "Login Successfully", 200, res);
});

exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

exports.getUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
        succss: true, user
    })
})

exports.getAllUser = catchAsyncError(async (req, res, next) => {
    const user = await User.find()
    res.status(200).json({
        succss: true, user
    })
})

exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }
    const updatedData = {
        fullName: req.body.fullName,
        email: req.body.email,
        aboutMe: req.body.aboutMe,
        phone: req.body.phone,
        portfolioURL: req.body.portfolioURL,
        githubURL: req.body.githubURL,
        instagram: req.body.instagram,
        linkedIn: req.body.linkedIn,
        twitterURL: req.body.twitterURL,
    }
    if (req.files && req.files.profileImage) {
        if (user.avatar && user.avatar.public_id) {
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: user.avatar.public_id,
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
        }

        const profileImage = req.files.profileImage[0];
        updatedData.avatar = {
            public_id: profileImage.key,
            url: profileImage.location,
        };
    }

    if (req.files && req.files.resume) {
        if (user.resume && user.resume.public_id) {
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: user.resume.public_id,
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
        }

        const resumeFile = req.files.resume[0];
        updatedData.resume = {
            public_id: resumeFile.key,
            url: resumeFile.location,
        };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
    });
})

exports.updatePassword = catchAsyncError(async (req, res, next) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return next(new ErrorHandler("Please Fill All Fields.", 400));
    }
    const isPasswordMatched = await user.comparePassword(currentPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Incorrect Current Password!"));
    }
    if (newPassword !== confirmNewPassword) {
        return next(
            new ErrorHandler("New Password And Confirm New Password Do Not Match!")
        );
    }

    user.password = newPassword
    await user.save()
    res.status(200).json({
        success: true,
        message: "Password Changed Successfully"
    })
})

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("User Not Found!", 404));
    }
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`;

    const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl}  \n\n If 
  You've not requested this email then, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Personal Portfolio Dashboard Password Recovery`,
            message,
        });
        res.status(201).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
        return next(
            new ErrorHandler(
                "Reset password token is invalid or has been expired.",
                400
            )
        );
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    generateToken(user, "Reset Password Successfully!", 200, res);
})

exports.getUserForPortfolio = catchAsyncError(async (req, res, next) => {
    const id = "66fe6caacb0105a3e8cf4cfb"
    const user = await User.findById(id);
    res.status(200).json({
        success: true,
        user,
    });
});