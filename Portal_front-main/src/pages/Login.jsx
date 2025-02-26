import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Loader from "../components/Layout/Loader";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // ✅ Get login function from AuthContext
  const navigate = useNavigate();

  // ✅ Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // ✅ Ensure form fields are not empty
    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/api/auth/login", formData, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("Login Response:", data); // ✅ Debugging API response

      // ✅ Validate API response before using
      if (!data || !data.user || !data.token) {
        throw new Error("Invalid response from server.");
      }

      // ✅ Store token and user details
      login(data.user, data.token); 
      localStorage.setItem("user_id", data.user.id);
      localStorage.setItem("user_name", data.user.name);

      // ✅ Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-card">
        <header className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div role="alert" className="auth-alert error">
              {error}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              className="form-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              className="form-input"
              autoComplete="current-password"
              required
            />
            <div className="auth-footer-links">
              <Link to="/forgot-password" className="auth-link">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            className="primary-button"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? <Loader size="small" /> : "Sign In"}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Login;
