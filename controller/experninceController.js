const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { catchAsyncError } = require("../middleware/catchAAsyncError.js");
const { ErrorHandler } = require("../middleware/error.js");
const { Experience } = require("../models/experienceSchema.js");
const { User } = require("../models/userSchema.js");
const s3 = require("../middleware/s3.js")
const dotenv = require('dotenv');

dotenv.config();


exports.addExperience = catchAsyncError(async (req, res, next) => {
    const { designation, company, details, from, to } = req.body

    if (!designation || !company || !details || !from || !to) {
        return next(new ErrorHandler("Kindly fill all required details", 400));
    }

    const companyLogo = req.files && req.files.companyLogo ? req.files.companyLogo[0] : null;
    // console.log(companyLogo);

    if (!companyLogo) {
        return next(new ErrorHandler("Company logo required", 400))
    }

    const newExperienceData = {
        designation,
        company,
        details,
        from,
        to,
        companyLogo: {
            public_id: companyLogo.key,
            url: companyLogo.location,
        }
    };

    try {
        const newExperience = new Experience(newExperienceData);
        const data = await newExperience.save();

        res.status(200).json({
            success: true,
            message: "Experience Added Successfully",
            data
        });
    } catch (error) {
        return next(new ErrorHandler("Failed to add experience:", error.message, 500));
    }
})

exports.updateExperience = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const experience = await Experience.findById(id);
    // console.log("Request Params:", req.params); 
    // console.log("Request Body:", req.body);

    if (!experience) {
        return next(new ErrorHandler("Experience details not found", 404));
    }

    const updateExperienceData = {
        designation: req.body.designation,
        company: req.body.company,
        details: req.body.details,
        from: req.body.from,
        to: req.body.to
    };

    if (req.files && req.files.companyLogo) {
        if (experience.companyLogo && experience.companyLogo.public_id) {
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: experience.companyLogo.public_id,
            };
            console.log(deleteParams);

            try {
                const test = await s3.send(new DeleteObjectCommand(deleteParams));
                console.log(test, "kljh");
                
            } catch (error) {
                console.log(error);

                return next(new ErrorHandler(`Failed to delete old company logo: ${error.message}`, 500));
                
            }
        }

        const companyLogo = req.files.companyLogo[0];
        updateExperienceData.companyLogo = {
            public_id: companyLogo.key,
            url: companyLogo.location,
        };
    }

    try {
        const updatedExperience = await Experience.findByIdAndUpdate(id, updateExperienceData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Experience updated successfully",
            updatedExperience
        });
    } catch (error) {
        return next(new ErrorHandler(`Failed to update experience: ${error.message}`, 500));
    }
});

exports.getAllExperience = catchAsyncError(async (req, res, next) => {
    const expernince = await Experience.find()
    res.status(200).json({
        success: true,
        expernince,
    });
})

exports.getOneExpernince = catchAsyncError(async (req, res, next) => {
    const id = req.params.id;
    console.log(id);

    const expernince = await Experience.findById(id)
    if (!expernince) {
        return (next(
            new ErrorHandler("Experience details not found", 400)
        ));
    }
    res.status(200).json({
        success: true,
        expernince,
    });
})

exports.deleteExperience = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    const exprenince = await Experience.findById(id)

    if (!exprenince) {
        return (next(new ErrorHandler("Exprenince already deleted", 400)))
    }
    await exprenince.deleteOne()

    res.status(200).json({
        success: true,
        message: "Exprenince deleted"
    })
})