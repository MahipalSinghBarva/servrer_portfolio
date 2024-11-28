const mongoose = require("mongoose");

const softwareApplicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    svg: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }
})

module.exports.SoftwareApplication = mongoose.model("SoftwareApplication", softwareApplicationSchema)