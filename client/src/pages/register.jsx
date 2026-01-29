import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Keep your existing import

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // New States for Role & Org Code
  const [role, setRole] = useState("user"); // Default to 'user' (Employee)
  const [orgCode, setOrgCode] = useState(""); 
  
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null); // To show the code to new Admins

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Prepare payload based on role
      const payload = {
        name,
        email,
        password,
        role,
      };
      
      // Only add orgCode if registering as a User (Employee)
      if (role === "user") {
        payload.orgCode = orgCode;
      }

      const res = await api.post("/api/auth/register", payload);

      if (role === "admin") {
        // If Admin, don't redirect yet. Show them their new Org Code.
        setSuccessData(res.data);
      } else {
        // If User, go straight to login
        navigate("/login");
      }
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError(
        err.response?.data?.message || "Registration failed"
      );
    }
  };

  // SUCCESS VIEW: For Admins who just registered
  if (successData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md rounded-xl border border-green-500/30 bg-slate-900 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Organization Created!</h2>
          <p className="mb-6 text-slate-400">Your Organization Code is:</p>
          
          <div className="mb-6 rounded-lg bg-slate-950 border border-slate-800 p-4">
            <span className="text-3xl font-mono font-bold text-blue-400 tracking-wider select-all">
              {successData.orgCode}
            </span>
          </div>
          
          <p className="mb-6 text-sm text-slate-500">
            Share this code with your employees so they can join your organization.
          </p>
          
          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-500"
          >
            Proceed to Login
          </button>
        </div>
      </div>
    );
  }

  // REGISTER FORM
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold text-white mb-1">
          Create account
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Start building forms
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ROLE SELECTOR */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`py-2 text-xs font-medium rounded-md transition-colors ${
                role === "user"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`py-2 text-xs font-medium rounded-md transition-colors ${
                role === "admin"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Org Admin
            </button>
          </div>

          <input
            type="text"
            placeholder="Full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
          />

          {/* CONDITIONAL INPUT: Org Code (Only for Users) */}
          {role === "user" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <input
                type="text"
                placeholder="Organization Code (e.g. A1B2C3)"
                required
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                className="w-full rounded-lg bg-slate-950 border border-yellow-500/30 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-yellow-500 placeholder:text-slate-500"
              />
              <p className="mt-1 text-xs text-slate-500 ml-1">
                Ask your Admin for the code.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            {role === "admin" ? "Register & Get Code" : "Join Organization"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-400 text-center">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-400 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}