import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CONFIG from "../Config";
import './Home.css';

function AppRegister() {
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    phone_number: "",
    profile_image: "",
    password: "",
    retype_password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "profile_image") {
      setFormData({
        ...formData,
        profile_image: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.retype_password) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("user_name", formData.user_name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone_number", formData.phone_number);
      formDataToSend.append("password", formData.password);

      if (formData.profile_image) {
        formDataToSend.append("profile_image", formData.profile_image);
      }

      const res = await fetch(`${CONFIG.API_BASE_URL}/enduser`, {
        method: "POST",
        body: formDataToSend,  // ❌ NO JSON
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful!");
        navigate("/applogin");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong!");
    }
  };


  return (
    <div className="login-page d-flex justify-content-center align-items-center vh-100 mt-5 mb-5">
      <div className="card shadow-lg" style={{ width: "35rem" }}>
        <div className="card-body p-4">
          <h5 className="card-title text-center fs-1">Register</h5>
          <p className="text-center text-muted">Create your account to get started!</p>
          <hr />

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-3">
              <label className="form-label">User Name</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input type="text" name="user_name" className="form-control" placeholder="Choose a Username" value={formData.user_name} onChange={handleChange} required />
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input type="email" name="email" className="form-control" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                <input type="text" name="phone_number" className="form-control" placeholder="Enter Phone Number" value={formData.phone_number} onChange={handleChange} required />
              </div>
            </div>

            {/* Profile Image */}
            <div className="mb-3">
              <label className="form-label">Profile Image URL (Optional)</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-image"></i></span>
                <input type="file" name="profile_image" className="form-control" placeholder="Paste image link" onChange={handleChange} />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input type={showPassword ? "text" : "password"} name="password" className="form-control" placeholder="Create Password" value={formData.password} onChange={handleChange} required />
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                  <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>
              </div>
            </div>

            {/* Retype Password */}
            <div className="mb-3">
              <label className="form-label">Retype Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-shield-check"></i></span>
                <input type={showPassword ? "text" : "password"} name="retype_password" className="form-control" placeholder="Confirm Password" value={formData.retype_password} onChange={handleChange} required />
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                  <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="d-grid gap-2 pt-3">
              <button type="submit" className="btn btn-primary">Sign Up</button>
            </div>

            <div className="text-center pt-3">
              <span>Already have an account? </span>
              <a href="/applogin" className="text-decoration-none">Login here</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AppRegister;