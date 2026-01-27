const FormSubmission = require("../models/FormSubmission");
const SubmissionRevision = require("../models/SubmissionRevision");

/**
 * PUT /api/submissions/:submissionId
 * Save a revision (DO NOT overwrite submission)
 */
exports.editSubmission = async (req, res) => {
  try {
    const { values } = req.body;

    if (!values || Object.keys(values).length === 0) {
      return res.status(400).json({ message: "Values required" });
    }

    const submission = await FormSubmission.findById(
      req.params.submissionId
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Save revision
    await SubmissionRevision.create({
      submissionId: submission._id,
      editedBy: req.userId,
      values,
    });

    // Mark original as edited
    submission.isEdited = true;
    await submission.save();

    res.json({ message: "Submission updated (revision saved)" });
  } catch (err) {
    console.error("Edit submission error:", err);
    res.status(500).json({ message: "Failed to edit submission" });
  }
};
