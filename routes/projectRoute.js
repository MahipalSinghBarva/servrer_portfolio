const express = require("express");

const { uploadFields } = require("../middleware/s3.js")
const { isAuthenticated } = require("../middleware/auth.js");
const { addNewProject, updateProject, getAllProject, getSingleProject, deleteProject } = require("../controller/projectController.js");

const router = express.Router();

router.post("/add", isAuthenticated, uploadFields, addNewProject);
router.put("/update/:id", isAuthenticated, uploadFields, updateProject);
router.get("/getall", getAllProject);
router.get("/:id", getSingleProject);
router.delete("/delete/:id", isAuthenticated, deleteProject);

module.exports = router;
