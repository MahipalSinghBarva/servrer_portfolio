const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
    companyLogo: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    designation: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },

    from: { type: String, required: true },
    to: { type: String, required: true },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports.Experience = mongoose.model("Experience", experienceSchema);
