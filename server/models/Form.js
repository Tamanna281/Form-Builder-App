// mern-auth-app\server\models\Form.js
const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    label: { type: String, required: true },
    required: { type: Boolean, default: false },
    options: { type: Array }, // for select, radio (optional)
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fields: { type: [fieldSchema], required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Form", formSchema);
