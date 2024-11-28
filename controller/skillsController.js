const { Skills } = require("../models/skillsSchema.js");
const { User } = require("../models/userSchema.js");
const { catchAsyncError } = require("../middleware/catchAAsyncError.js");
const { ErrorHandler } = require("../middleware/error.js");
const { s3 } = require("../middleware/s3.js")
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config();

exports.addSkills = catchAsyncError(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Image For Skill Required!", 404));
    }

    const { title, proficiency } = req.body;
    if (!title || !proficiency) {
        return next(new ErrorHandler("Please Fill Full Form!", 400));
    }
    const skillImg = req.files && req.files.svg ? req.files.svg[0] : null;

    const skill = await Skills.create({
        title,
        proficiency,
        svg: skillImg ? {
            public_id: skillImg.key,
            url: skillImg.location,
        } : null
    });
    res.status(201).json({
        success: true,
        message: "New Skill Added",
        skill,
    });
})

exports.updateSkills = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const { id } = req.params;
    let skill = await Skills.findById(id);
    if (!skill) {
        return next(new ErrorHandler("Skill not found!", 404));
    }

    const newSkill = { title: req.body.title, proficiency: req.body.proficiency }


    if (req.files && req.files.svg) {
        if (user.svg && user.svg.public_id) {
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: user.svg.public_id,
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
        }

        const skillImg = req.files.svg[0];
        newSkill.svg = {
            public_id: skillImg.key,
            url: skillImg.location,
        };
    }

    skill = await Skills.findByIdAndUpdate(
        id,
        newSkill,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
        message: "Skill Updated Successfully",
    });
})

exports.deleteSkills = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    let skill = await Skills.findById(id);
    if (!skill) {
        return next(new ErrorHandler("Sill not found or already deleted!", 404));
    }

    const skillImg = skill.svg.public_id;

    if (skill.svg && skill.svg.public_id) {
        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: skillImg,
        };
        await s3.send(new DeleteObjectCommand(deleteParams));
    }

    await skill.deleteOne();

    res.status(200).json({
        success: true,
        message: "Skill deleted successfully!",
    });
})

exports.getAllSkills = catchAsyncError(async (req, res, next) => {
    const skill = await Skills.find();
    res.status(200).json({
        success: true,
        skill,
    });
})