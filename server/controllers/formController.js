const Form = require("../models/Form");

// Save a new form

exports.saveForm = async (req, res) => {
  try {
    const { name, fields } = req.body;

    if (!name || !fields || fields.length === 0) {
      return res.status(400).json({ message: "Form name and fields are required" });
    }

    const form = await Form.create({
      name,
      fields,
      createdBy: req.userId,
    });

    res.status(201).json(form);
  } catch (error) {
    console.error("Error saving form:", error);
    res.status(500).json({ message: "Failed to save form" });
  }
};

// Get all forms created by logged-in user
exports.getForms = async (req, res) => {
  try {
    const forms = await Form.find({ createdBy: req.userId }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Failed to fetch forms" });
  }
};

// Update existing form
exports.updateForm = async (req, res) => {
  try {
    const { name, fields } = req.body;
    const formId = req.params.id;

    const updatedForm = await Form.findOneAndUpdate(
      { _id: formId, createdBy: req.userId }, // ownership check
      { name, fields },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json(updatedForm);
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(500).json({ message: "Failed to update form" });
  }
};
