const FormSubmission = require("../models/FormSubmission");

/**
 * POST /api/forms/:formId/submissions
 * Create a new submission
 */
exports.createSubmission = async (req, res) => {
  try {
    const { values } = req.body;

    if (!values || Object.keys(values).length === 0) {
      return res.status(400).json({ message: "Submission values required" });
    }

    const submission = await FormSubmission.create({
      formId: req.params.formId,
      submittedBy: req.userId,
      values,
    });

    res.status(201).json(submission);
  } catch (err) {
    console.error("Create submission error:", err);
    res.status(500).json({ message: "Failed to submit form" });
  }
};

/**
 * GET /api/forms/:formId/submissions
 * Get all submissions for a form (ADMIN)
 */
exports.getFormSubmissions = async (req, res) => {
  try {
    const submissions = await FormSubmission.find({
      formId: req.params.formId,
    })
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error("Fetch submissions error:", err);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};
