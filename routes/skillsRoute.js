const express = require("express");

const { uploadFields } = require("../middleware/s3.js")
const { isAuthenticated } = require("../middleware/auth.js");
const { addSkills, updateSkills, getAllSkills, deleteSkills } = require("../controller/skillsController.js");


const router = express.Router();

router.post("/add", isAuthenticated, uploadFields, addSkills);
router.put("/update/:id", isAuthenticated, uploadFields, updateSkills);
router.get("/getaLL", getAllSkills);
router.delete("/delete/:id", isAuthenticated, deleteSkills);

module.exports = router;