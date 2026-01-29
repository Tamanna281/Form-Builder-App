const FormSubmission = require("../models/FormSubmission");
const Form = require("../models/Form");
const User = require("../models/User");

/**
 * POST /api/forms/:formId/submissions
 * Create a new submission (Secure: Enforces Silo)
 */
exports.createSubmission = async (req, res) => {
  try {
    const { values } = req.body;
    const { formId } = req.params;

    if (!values || Object.keys(values).length === 0) {
      return res.status(400).json({ message: "Submission values required" });
    }

    // 1. Fetch User and Form to validate "Silo"
    const user = await User.findById(req.userId);
    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // 2. SECURITY CHECK: Can this user submit to this form?
    // If it's a standard user, they must be linked to the Admin who created the form.
    if (user.role === "user") {
      if (!user.linkedAdmin || form.createdBy.toString() !== user.linkedAdmin.toString()) {
         return res.status(403).json({ 
           message: "Access Denied: You can only submit forms from your organization." 
         });
      }
    }

    // 3. Create Submission
    const submission = await FormSubmission.create({
      formId,
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
 * Get submissions (Smart: Admin sees all, User sees own)
 */
exports.getFormSubmissions = async (req, res) => {
  try {
    const { formId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Prepare Base Query
    let query = { formId };

    // 2. ROLE-BASED LOGIC
    if (user.role === "admin") {
      // --- ADMIN FLOW ---
      // Security: Admin can ONLY see submissions for forms they own.
      const form = await Form.findById(formId);
      if (!form) return res.status(404).json({ message: "Form not found" });

      if (form.createdBy.toString() !== req.userId) {
        return res.status(403).json({ message: "Access Denied: You do not own this form." });
      }
      // If owner, query remains { formId } (Show All)

    } else {
      // --- USER FLOW ---
      // Security: User can ONLY see their OWN submissions.
      query.submittedBy = req.userId;
    }

    // 3. Execute Query
    const submissions = await FormSubmission.find(query)
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(submissions);

  } catch (err) {
    console.error("Fetch submissions error:", err);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};