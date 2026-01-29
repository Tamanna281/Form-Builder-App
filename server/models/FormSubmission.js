// server\models\FormSubmission.js
const mongoose = require("mongoose");

const formSubmissionSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    // The User (Employee) who filled the form
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    // The actual answers (Map allows flexible keys based on Form Field IDs)
    values: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // Track if it was modified after original submission
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("FormSubmission", formSubmissionSchema);