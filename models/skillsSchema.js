const mongoose = require("mongoose")


const skillSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    proficiency: {
        type: Number,
    },
    svg: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
});

module.exports.Skills = mongoose.model("Skills", skillSchema)