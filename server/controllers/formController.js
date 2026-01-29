const Form = require("../models/Form");
const User = require("../models/User"); // Import User to check roles

// Save a new form (ADMIN ONLY)
exports.saveForm = async (req, res) => {
  try {
    const { name, fields } = req.body;

    // 1. Fetch User to check Role
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Only Admins can create forms" });
    }

    if (!name || !fields || fields.length === 0) {
      return res.status(400).json({ message: "Form name and fields are required" });
    }

    const form = await Form.create({
      name,
      fields,
      createdBy: req.userId, // Owned by the Admin
    });

    res.status(201).json(form);
  } catch (error) {
    console.error("Error saving form:", error);
    res.status(500).json({ message: "Failed to save form" });
  }
};

// Get forms (Multi-Tenant Logic)
exports.getForms = async (req, res) => {
  try {
    // 1. Fetch the logged-in user to see who they are
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let query = {};

    // 2. LOGIC: SEPARATE THE SILOS
    if (user.role === "admin") {
      // ADMIN: Sees forms *they* created
      query = { createdBy: req.userId };
    } else {
      // USER: Sees forms created by their *Linked Admin*
      if (!user.linkedAdmin) {
        return res.json([]); // If not linked to anyone, see nothing
      }
      query = { createdBy: user.linkedAdmin };
    }

    // 3. Execute Query
    const forms = await Form.find(query).sort({ createdAt: -1 });
    res.json(forms);

  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Failed to fetch forms" });
  }
};

// Update existing form (ADMIN ONLY)
exports.updateForm = async (req, res) => {
  try {
    const { name, fields } = req.body;
    const formId = req.params.id;

    // 1. Fetch User to check Role
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Only Admins can edit forms" });
    }

    // 2. Update (Ensure Admin owns the form)
    const updatedForm = await Form.findOneAndUpdate(
      { _id: formId, createdBy: req.userId }, // Strict ownership check
      { name, fields },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found or unauthorized" });
    }

    res.json(updatedForm);
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(500).json({ message: "Failed to update form" });
  }
};