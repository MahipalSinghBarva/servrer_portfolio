const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    description: {
        type: String,
        required: [true, "Description Required"],
    },
    timeline: {
        from: {
            type: String,
            required: [true, "Timeline  statring date must be filed"],
        },
        to: String,
    },
});

module.exports.Timeline = mongoose.model("Timeline", timelineSchema);
