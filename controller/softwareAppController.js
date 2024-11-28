const { catchAsyncError } = require("../middleware/catchAAsyncError.js");
const { ErrorHandler } = require("../middleware/error.js");
const { SoftwareApplication } = require("../models/softwareAppSchema.js");

exports.addNewApp = catchAsyncError(async (req, res, next) => {

    if (!req.files || !req.files.svg || req.files.svg.length === 0) {
        return next(new ErrorHandler("Software Application Icon/SVG is required", 400));
    }

    const { name } = req.body;
    if (!name) {
        return next(new ErrorHandler("Software's Name is required", 400));
    }

    const svg = req.files.svg[0];


    if (!svg) {
        return next(new ErrorHandler("SVG file upload failed", 500));
    }

    const softwareApplication = await SoftwareApplication.create({
        name,
        svg: {
            public_id: svg.key,
            url: svg.location
        }
    });

    res.status(200).json({
        success: true,
        message: "New Software Application Added!",
        softwareApplication
    });
});

exports.deleteApp = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const application = await SoftwareApplication.findById(id);
    if (!application) {
        return next(new ErrorHandler("Applicatio Software not found!"));
    }
    await application.deleteOne();
    res.status(200).json({
        success: true,
        message: "Applicatio Software deleted successfully",
    });
})

exports.getAllApp = catchAsyncError(async (req, res, next) => {
    const application = await SoftwareApplication.find();
    res.status(200).json({
        success: true,
        application,
    });
})