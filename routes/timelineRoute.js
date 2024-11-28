const express = require("express");


const { isAuthenticated } = require("../middleware/auth.js");
const { postTimeline, getAllTimeline, deleteTimeline } = require("../controller/timelineController.js");
const router = express.Router();


router.post("/add", isAuthenticated, postTimeline);
router.get("/getall", isAuthenticated, getAllTimeline);
router.delete("/delete/:id", isAuthenticated, deleteTimeline);

module.exports = router;
