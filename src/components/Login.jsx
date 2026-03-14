import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { loginStyles } from "../assets/dummyStyles";
import Logout from "./Logout";

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("authToken"))
  );
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      setIsAuthenticated(Boolean(localStorage.getItem("authToken")));
    };
    window.addEventListener("authStateChanged", handler);
    return () => window.removeEventListener("authStateChanged", handler);
  }, []);

  if (isAuthenticated) {
    return <Logout />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.remember) {
      setError('You must agree to "Remember me" before signing in.');
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/user/login",
        {
          email: formData.email,
          password: formData.password,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        // Persist token & user
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(user));

        setShowToast(true);
        window.dispatchEvent(new Event("authStateChanged"));

        // After toast, redirect home
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        // API responded with success: false
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      // Network or server error
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Login error");
      } else {
        setError("Unable to reach server");
      }
    }
  };

  return (
    <div className={loginStyles.page}>
      <Link to="/" className={loginStyles.backLink}>
        <FaArrowLeft className="mr-2" />
        Back to Home
      </Link>

      {showToast && (
        <div className={loginStyles.toast}>
          <FaCheck className="mr-2" />
          Login successful!
        </div>
      )}

      <div className={loginStyles.loginCard}>
        <div className={loginStyles.logoContainer}>
          <div className={loginStyles.logoOuter}>
            <div className={loginStyles.logoInner}>
              <FaUser className={loginStyles.logoIcon} />
            </div>
          </div>
        </div>

        <h2 className={loginStyles.title}>Welcome Back</h2>

        <form onSubmit={handleSubmit} className={loginStyles.form}>
          <div className={loginStyles.inputContainer}>
            <FaUser className={loginStyles.inputIcon} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className={loginStyles.input}
            />
          </div>

          <div className={loginStyles.inputContainer}>
            <FaLock className={loginStyles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className={loginStyles.passwordInput}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={loginStyles.toggleButton}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className={loginStyles.rememberContainer}>
            <label className={loginStyles.rememberLabel}>
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className={loginStyles.rememberCheckbox}
                required
              />
              Remember me
            </label>
            <Link to="#" className={loginStyles.forgotLink}>
              Forgot?
            </Link>
          </div>

          {error && <p className={loginStyles.error}>{error}</p>}

          <button type="submit" className={loginStyles.submitButton}>
            Sign In
          </button>
        </form>

        <p className={loginStyles.signupText}>
          Don't have an account?{" "}
          <Link to="/signup" className={loginStyles.signupLink}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
