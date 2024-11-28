const express = require("express");

const { uploadFields } = require("../middleware/s3.js")
const { isAuthenticated } = require("../middleware/auth.js");
const { addNewApp, getAllApp, deleteApp } = require("../controller/softwareAppController.js");

const router = express.Router();


router.post("/add", isAuthenticated, uploadFields, addNewApp);
router.get("/getall", isAuthenticated, getAllApp);
router.delete("/delete/:id", isAuthenticated, deleteApp);

module.exports = router;
