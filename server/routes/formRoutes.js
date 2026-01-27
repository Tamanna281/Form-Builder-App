// mern-auth-app\server\routes\formRoutes.js
const express = require("express");
const router = express.Router();
const Form = require("../models/Form");

const {
  createSubmission,
  getFormSubmissions,
} = require("../controllers/formSubmissionController");

const {
  editSubmission,
} = require("../controllers/submissionEditController");


const authMiddleware = require("../middleware/authMiddleware");
const {
  saveForm,
  getForms,
  updateForm,
} = require("../controllers/formController");

// Save a new form (protected)
router.post("/", authMiddleware, saveForm);

// Get all forms for logged-in user (protected)
router.get("/", authMiddleware, getForms);

// Update an existing form (protected)
router.put("/:id", authMiddleware, updateForm);

// SUBMIT FORM (employee)
router.post(
  "/:formId/submissions",
  authMiddleware,
  createSubmission
);

// GET FORM SUBMISSIONS (admin)
router.get(
  "/:formId/submissions",
  authMiddleware,
  getFormSubmissions
);

// EDIT SUBMISSION (save revision)
router.put(
  "/submissions/:submissionId",
  authMiddleware,
  editSubmission
);



// GET single form by ID (for Form Renderer)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      createdBy: req.userId,
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ message: "Failed to fetch form" });
  }
});

// DELETE form
router.delete("/:id", async (req, res) => {
  console.log("DELETE FORM ID:", req.params.id);
  try {
    await Form.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
