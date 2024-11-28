const { catchAsyncError } = require("../middleware/catchAAsyncError.js");
const { ErrorHandler } = require("../middleware/error.js");
const { Project } = require("../models/projectSchema.js");
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { User } = require("../models/userSchema.js");
const { s3 } = require("../middleware/s3.js")

const dotenv = require('dotenv');


dotenv.config();


exports.addNewProject = catchAsyncError(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Project Banner Image Required", 404))
    }

    const {
        title,
        description,
        gitRepoLink,
        projectLink,
        stack,
        technologies,
        deployed,
    } = req.body;
    if (
        !title || !description || !gitRepoLink || !projectLink || !stack || !technologies ||
        !deployed
    ) {
        return next(new ErrorHandler("Please Provide All Details!", 400));
    }

    const projectBannerImg = req.files && req.files.projectBanner ? req.files.projectBanner[0] : null;

    const project = await Project.create({
        title,
        description,
        gitRepoLink,
        projectLink,
        stack,
        technologies,
        deployed,
        projectBanner: projectBannerImg ? {
            public_id: projectBannerImg.key,
            url: projectBannerImg.location,
        } : null,

    })
    res.status(201).json({
        success: true,
        message: "New Project Added!",
        project,
    });
})

exports.updateProject = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }
    const newProjectData = {
        title: req.body.title,
        description: req.body.description,
        stack: req.body.stack,
        technologies: req.body.technologies,
        deployed: req.body.deployed,
        projectLink: req.body.projectLink,
        gitRepoLink: req.body.gitRepoLink,
    };

    if (req.files && req.files.projectBanner) {
        if (user.projectBanner && user.projectBanner.public_id) {
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: user.avatar.public_id,
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
        }

        const projectBannerImg = req.files.projectBanner[0];
        newProjectData.projectBanner = {
            public_id: projectBannerImg.key,
            url: projectBannerImg.location,
        };
    }
    const project = await Project.findByIdAndUpdate(
        req.params.id,
        newProjectData,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );
    res.status(200).json({
        success: true,
        message: "Project Updated!",
        project,
    });
})

exports.getAllProject = catchAsyncError(async (req, res, next) => {
    const projects = await Project.find();
    res.status(200).json({
        success: true,
        projects,
    });
})

exports.getSingleProject = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    try {
        const project = await Project.findById(id)
        res.status(200).json({
            success: true,
            project
        })
    } catch (error) {
        res.status(400).json({ error })
    }
})

exports.deleteProject = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
        return next(new ErrorHandler("Project not found or already deleted", 404));
    }

    const projectImageId = project.projectBanner.public_id;

    if (project.projectBanner && project.projectBanner.public_id) {
        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: projectImageId,
        };
        await s3.send(new DeleteObjectCommand(deleteParams));
    }

    await project.deleteOne();

    res.status(200).json({
        success: true,
        message: "Project deleted successfully!",
    });
});