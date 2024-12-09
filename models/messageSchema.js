const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    senderName: {
        type: String,
        minLength: [2, "Name must contain at least 2 characters"],
    },
    email: {
        type: String,
        minLength: [2, "Email must contain at least 2 characters"],
    },
    message: {
        type: String,
        minLength: [2, "Message must contain at least 2 characters"],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports.Message = mongoose.model("Message", messageSchema);