import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CONFIG from "../Config";
import { AuthContext } from "../AuthContext";
import './Home.css';


function Applogin() {
     const [user_name, setUser_name] = useState("");
     const [password, setPassword] = useState("");
     const [showPassword, setShowPassword] = useState(false);
     const navigate = useNavigate();
     const { login } = useContext(AuthContext);

     const handleSubmit = async (e) => {
          e.preventDefault(); // prevent page reload

          try {
               const res = await fetch(`${CONFIG.API_BASE_URL}/applogin`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_name, password }),
               });

               const data = await res.json(); // parse response
               console.log("Backend response:", data);

               if (data.token) {
                    // localStorage.setItem("token", data.token); // save token
                    // localStorage.setItem("user", JSON.stringify(data.user)); //save user
                    // setToken(data.token);
                    login(data.token)
                    console.log(data.token);
                    navigate("/home"); // go to dashboard
               } else {
                    alert(data.error || "Login failed"); // default alert
               }
          } catch (err) {
               console.error("Error:", err);
               alert("Something went wrong!"); // default alert
          }
     };

     return (
          <div className="login-page d-flex justify-content-center align-items-center vh-100">
               <div
                    className="card shadow-lg "
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
                                             onChange={(e) => setUser_name(e.target.value)}
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
                                             onChange={(e) => setPassword(e.target.value)}
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

                              <div className="d-grid gap-2 pt-3">
                                   <a href="/appregister">Register</a>
                              </div>
                         </form>
                    </div>
               </div>
          </div >
     );
}

export default Applogin;


// // AppLogin.jsx - ✅ FIXED for App Users Only
// import React, { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import CONFIG from "../Config";
// import { AuthContext } from "../AuthContext"; // Your existing context
// import './Home.css';

// function Applogin() {
//      const [user_name, setUser_name] = useState("");
//      const [password, setPassword] = useState("");
//      const [showPassword, setShowPassword] = useState(false);
//      const [loading, setLoading] = useState(false);
//      const navigate = useNavigate();
//      const { login } = useContext(AuthContext); // Keep your existing context

//      const handleSubmit = async (e) => {
//           e.preventDefault();
//           setLoading(true);

//           try {
//                // ✅ APP LOGIN ENDPOINT
//                const res = await fetch(`${CONFIG.API_BASE_URL}/applogin`, {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ user_name, password }),
//                });

//                const data = await res.json();
//                console.log("📱 APP Login response:", data);

//                // Applogin.jsx - ✅ ADD THESE 8 LINES after token save
//                if (data.token) {
//                     localStorage.setItem("appToken", data.token);
//                     localStorage.setItem("token", data.token);

//                     // ✅ LOAD APP USER DATA
//                     try {
//                          const dataRes = await fetch(`${CONFIG.API_BASE_URL}/app/data`, {
//                               headers: { 'Authorization': `Bearer ${data.token}` }
//                          });
//                          const userData = await dataRes.json();
//                          console.log('📱 APP DATA LOADED:', userData);
//                     } catch (err) {
//                          console.log('⚠️ App data optional');
//                     }

//                     login(data.token, false);
//                     console.log("✅ App login successful");
//                     navigate("/home");
//                } else {
//                     alert(data.error || "App login failed");
//                }
//           } catch (err) {
//                console.error("App login error:", err);
//                alert("App login failed - check connection");
//           } finally {
//                setLoading(false);
//           }
//      };

//      return (
//           <div className="login-page d-flex justify-content-center align-items-center vh-100">
//                <div
//                     className="card shadow-lg"
//                     style={{ width: "30rem", justifyContent: "center", height: "32rem" }}
//                >
//                     <div className="card-body">
//                          <h5 className="card-title text-center fs-1">📱 Travel App</h5>
//                          <p className="text-center text-muted">
//                               Enter your Username and Password to Login!
//                          </p>
//                          <hr />

//                          <form onSubmit={handleSubmit}>
//                               {/* Username */}
//                               <div className="mb-3">
//                                    <label className="form-label">User Name</label>
//                                    <div className="input-group">
//                                         <span className="input-group-text">
//                                              <i className="bi bi-person"></i>
//                                         </span>
//                                         <input
//                                              type="text"
//                                              className="form-control"
//                                              placeholder="Enter Your Username"
//                                              value={user_name}
//                                              onChange={(e) => setUser_name(e.target.value)}
//                                              required
//                                              disabled={loading}
//                                         />
//                                    </div>
//                               </div>

//                               {/* Password */}
//                               <div className="mb-3">
//                                    <label className="form-label">Password</label>
//                                    <div className="input-group">
//                                         <span className="input-group-text">
//                                              <i className="bi bi-lock"></i>
//                                         </span>
//                                         <input
//                                              type={showPassword ? "text" : "password"}
//                                              className="form-control"
//                                              placeholder="Enter Password"
//                                              value={password}
//                                              onChange={(e) => setPassword(e.target.value)}
//                                              required
//                                              disabled={loading}
//                                         />
//                                         <button
//                                              type="button"
//                                              className="btn btn-outline-secondary"
//                                              onClick={() => setShowPassword(!showPassword)}
//                                              disabled={loading}
//                                         >
//                                              <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
//                                         </button>
//                                    </div>
//                               </div>

//                               {/* Submit Button */}
//                               <div className="d-grid gap-2 pt-3">
//                                    <button
//                                         type="submit"
//                                         className="btn btn-primary"
//                                         disabled={loading}
//                                    >
//                                         {loading ? "Logging in..." : "App Login"}
//                                    </button>
//                               </div>

//                               <div className="d-grid gap-2 pt-3 text-center">
//                                    <a href="/appregister" className="btn btn-link">Register New Account</a>
//                               </div>
//                          </form>
//                     </div>
//                </div>
//           </div>
//      );
// }

// export default Applogin;