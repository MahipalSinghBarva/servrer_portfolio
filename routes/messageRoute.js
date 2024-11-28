const express = require("express");

const { sendMessage, getAllMessage, deleteMessage } = require("../controller/messageController.js")
const { isAuthenticated } = require("../middleware/auth.js");
const router = express.Router();


router.post("/send", sendMessage);
router.get("/getall", getAllMessage);
router.delete("/delete/:id", isAuthenticated, deleteMessage);



module.exports = router;
