import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import FormBuilder from "./pages/FormBuilder";
import FormEditor from "./pages/FormEditor";
import FormSubmissions from "./pages/FormSubmissions";
import FormFill from "./pages/FormFill";
import EditSubmission from "./pages/EditSubmission";

// Simple auth guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <FormBuilder />
            </PrivateRoute>
          }
        />

        <Route
          path="/forms/:id/edit"
          element={
            <PrivateRoute>
              <FormEditor />
            </PrivateRoute>
          }
        />

        <Route
          path="/forms/:id/submissions"
          element={
            <PrivateRoute>
              <FormSubmissions />
            </PrivateRoute>
          }
        />

        <Route
          path="/submissions/:submissionId/edit"
          element={
            <PrivateRoute>
              <EditSubmission />
            </PrivateRoute>
          }
        />

        <Route
          path="/forms/:id/fill"
          element={
            <PrivateRoute>
              <FormFill />
            </PrivateRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
