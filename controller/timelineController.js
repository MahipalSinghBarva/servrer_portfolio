const { catchAsyncError } = require("../middleware/catchAAsyncError.js");
const { ErrorHandler } = require("../middleware/error.js");
const { Timeline } = require("../models/timelineSchema.js");

exports.postTimeline = catchAsyncError(async (req, res, next) => {
    const { title, description, from, to } = req.body;
    const newTimeline = await Timeline.create({
        title,
        description,
        timeline: { from, to },
    });
    res.status(200).json({
        success: true,
        message: "Timeline added",
        newTimeline,
    });
})

exports.deleteTimeline = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const timeline = await Timeline.findById(id);
    if (!timeline) {
        return next(new ErrorHandler("Timeline not found!"));
    }
    await timeline.deleteOne();
    res.status(200).json({
        success: true,
        message: "Timeline deleted successfully",
    });
})

exports.getAllTimeline = catchAsyncError(async (req, res, next) => {
    const timeline = await Timeline.find();
    res.status(200).json({
        success: true,
        timeline,
    });
})