const express = require("express");
const { uploadFields } = require("../middleware/s3.js")


const { isAuthenticated } = require("../middleware/auth.js");
const { addExperience, getAllExperience, deleteExperience, updateExperience, getOneExpernince } = require("../controller/experninceController.js");
const router = express.Router();


router.post("/add", uploadFields, addExperience);
router.get("/getall", getAllExperience);
router.delete("/delete/:id", isAuthenticated, deleteExperience);
router.put("/update/:id", isAuthenticated, uploadFields, updateExperience);
router.get("/:id", getOneExpernince);


module.exports = router;
