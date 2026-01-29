import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import FormBuilder from "./pages/FormBuilder";
import FormEditor from "./pages/FormEditor";
import FormSubmissions from "./pages/FormSubmissions";
import FormFill from "./pages/FormFill";
import EditSubmission from "./pages/EditSubmission";

// Auth Guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Both / and /dashboard point to the main Dashboard (FormBuilder) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <FormBuilder />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <FormBuilder />
            </PrivateRoute>
          }
        />

        {/* Form Routes */}
        <Route
          path="/forms/:id/edit"
          element={
            <PrivateRoute>
              <FormEditor />
            </PrivateRoute>
          }
        />

        {/* Works for both Admin (All Data) and User (Own Data) */}
        <Route
          path="/forms/:id/submissions"
          element={
            <PrivateRoute>
              <FormSubmissions />
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

        <Route
          path="/submissions/:submissionId/edit"
          element={
            <PrivateRoute>
              <EditSubmission />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;