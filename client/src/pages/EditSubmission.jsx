import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api"; 

const EditSubmission = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get submission
        const subRes = await api.get(
          `/api/submissions/${submissionId}`
        );

        setSubmission(subRes.data);
        setValues(subRes.data.values);

        // Get form schema
        const formRes = await api.get(
          `/api/forms/${subRes.data.formId}`
        );

        setForm(formRes.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load submission");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId]);

  const handleChange = (fieldId, value) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    try {
      await api.put(
        `/api/submissions/${submissionId}`,
        { values }
      );

      alert("Revision saved");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!form || !submission) return null;

  return (
    <div style={{ padding: "30px", maxWidth: "700px", margin: "0 auto" }}>
      <h2>Edit Submission</h2>

      {form.fields.map((field) => (
        <div key={field.id} style={{ marginBottom: "15px" }}>
          <label>{field.label}</label>
          <input
            value={values[field.id] || ""}
            onChange={(e) =>
              handleChange(field.id, e.target.value)
            }
            style={{ width: "100%" }}
          />
        </div>
      ))}

      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default EditSubmission;
