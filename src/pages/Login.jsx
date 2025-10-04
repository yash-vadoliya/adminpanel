import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CONFIG from "../Config";
import { useContext } from "react";
import { AuthContext } from "../AuthContext";

function Login() {
    const [user_name, setUser_name] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { setToken } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault(); // prevent page reload

        try {
            const setToken = localStorage.getItem("token");
            const res = await fetch(`${CONFIG.API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_name, password }), // ✅ send credentials
            });
            const data = await res.json(); // ✅ parse response first
            console.log("Backend response:", data);
            if (data.token) {
                localStorage.setItem("token", data.token); // save token
                // setToken(data.token);
                alert(data.message); // show success message
                navigate("/deshboard"); // 👈 go to home 
                // window.location.href = '/dashboard';
            } else {
                alert(data.error || "Login failed");
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div
                className="card shadow-lg"
                style={{ width: "30rem", justifyContent: "center", height: "32rem" }}
            >
                <div className="card-body">
                    <h5 className="card-title text-center fs-1">Login</h5>
                    <p className="text-center text-muted">
                        Enter your Username and Password to Login!
                    </p>
                    <hr />

                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="mb-3">
                            <label className="form-label">User Name</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-person"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Your Username"
                                    value={user_name}
                                    onChange={(e) => setUser_name(e.target.value)} // ✅ update state
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">
                                Password
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-lock"></i>
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    id="exampleInputPassword1"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)} // ✅ update state
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="mb-3 d-flex justify-content-between align-items-center">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="exampleCheck1"
                                />
                                <label className="form-check-label" htmlFor="exampleCheck1">
                                    Remember Me
                                </label>
                            </div>
                            <a href="/forgot-password" className="text-decoration-none small">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <div className="d-grid gap-2 pt-3">
                            <button type="submit" className="btn btn-primary">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;