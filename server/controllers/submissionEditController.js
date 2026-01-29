const FormSubmission = require("../models/FormSubmission");
const SubmissionRevision = require("../models/SubmissionRevision");
const Form = require("../models/Form"); // Required for ownership checks

/**
 * PUT /api/forms/submissions/:submissionId
 * Edit a submission (Secured & Versioned)
 */
exports.editSubmission = async (req, res) => {
  try {
    const { values } = req.body;
    const { submissionId } = req.params;

    if (!values || Object.keys(values).length === 0) {
      return res.status(400).json({ message: "Values required" });
    }

    // 1. Fetch Submission
    const submission = await FormSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // 2. Fetch Parent Form (to check Admin ownership)
    const form = await Form.findById(submission.formId);
    if (!form) {
      return res.status(404).json({ message: "Parent form not found" });
    }

    // 3. SECURITY & RBAC CHECK
    const isAdmin = req.userRole === "admin";
    const isOwner = submission.submittedBy.toString() === req.userId;
    const isFormCreator = form.createdBy.toString() === req.userId;

    if (isAdmin) {
      // Rule: Admins can only edit submissions that belong to their Organization's forms
      if (!isFormCreator) {
        return res.status(403).json({ 
          message: "Access Denied: You can only edit submissions for your own forms." 
        });
      }
    } else {
      // Rule: Employees can ONLY edit their own submissions
      if (!isOwner) {
        return res.status(403).json({ 
          message: "Access Denied: You can only edit your own submissions." 
        });
      }
    }

    // 4. Create Revision (History Log)
    // We save the NEW values into the revision history
    await SubmissionRevision.create({
      submissionId: submission._id,
      editedBy: req.userId,
      values,
    });

    // 5. Update Original Submission
    // We MUST update the main record so the Dashboard/Edit page reflects the changes.
    submission.values = values;
    submission.isEdited = true;
    await submission.save();

    res.json({ message: "Submission updated successfully" });

  } catch (err) {
    console.error("Edit submission error:", err);
    res.status(500).json({ message: "Failed to edit submission" });
  }
};