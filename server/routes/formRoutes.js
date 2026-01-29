const express = require("express");
const router = express.Router();
const Form = require("../models/Form");
const User = require("../models/User"); // Required for RBAC checks
const FormSubmission = require("../models/FormSubmission"); // Required for single submission fetch

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

// --- FORM MANAGEMENT (Admin) ---

// Save a new form (protected)
router.post("/", authMiddleware, saveForm);

// Get all forms (Admin sees theirs, User sees assigned)
router.get("/", authMiddleware, getForms);

// Update an existing form (protected)
router.put("/:id", authMiddleware, updateForm);

// DELETE form (Secured: Admin Only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // 1. Check Role
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // 2. Delete with Ownership Check
    const form = await Form.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId, // Only delete if YOU created it
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found or unauthorized" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// --- SUBMISSIONS & DATA (Must come BEFORE /:id route to avoid conflicts) ---

// SUBMIT FORM (User/Employee)
router.post("/:formId/submissions", authMiddleware, createSubmission);

// GET FORM SUBMISSIONS (Admin: All, User: Own)
router.get("/:formId/submissions", authMiddleware, getFormSubmissions);

// EDIT SUBMISSION (Update values)
router.put("/submissions/:submissionId", authMiddleware, editSubmission);

// [NEW] GET SINGLE SUBMISSION (For loading data into Edit Page)
router.get("/submissions/:submissionId", authMiddleware, async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.submissionId);
    
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    
    // Optional: Add ownership check here if strict security is needed
    // (e.g., allow if req.userId === submission.submittedBy OR req.userId === formOwner)

    res.json(submission);
  } catch (err) {
    console.error("Fetch Submission Error:", err);
    res.status(500).json({ message: "Failed to fetch submission" });
  }
});

// --- FORM RENDERING ---

// GET single form by ID (Smart: Allows Admin OR Linked Employees)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const user = await User.findById(req.userId);

    // ACCESS LOGIC:
    // 1. If Admin: Must be the owner.
    if (user.role === "admin") {
      if (form.createdBy.toString() !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
    } 
    // 2. If User: Must be linked to the Admin who created the form.
    else {
      if (!user.linkedAdmin || form.createdBy.toString() !== user.linkedAdmin.toString()) {
        return res.status(403).json({ message: "Access denied: You don't belong to this organization." });
      }
    }

    res.json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ message: "Failed to fetch form" });
  }
});

module.exports = router;