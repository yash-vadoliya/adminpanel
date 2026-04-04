import React, { useContext, useEffect, useState } from "react";
import "./ProfilePage.css";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [endUser, setEndUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [bookings, setBookings] = useState([]);
  const [paymentType, setPaymentType] = useState("");

  const [formData, setFormData] = useState({
    user_id: '',
    user_name: '',
    email: '',
    phone_number: '',
    profile_image: '',
  })


  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user?.user_id) return;

        const response = await fetch(
          `${CONFIG.API_BASE_URL}/enduser/${user.user_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setEndUser(data[0]);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    if (token && user) fetchUser();
  }, [token, user]);

  if (loading) return <h4 className="text-center mt-5">Loading...</h4>;
  if (!endUser) return <h4 className="text-danger text-center">Failed</h4>;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("user_id", formData.user_id);
      formDataToSend.append("user_name", formData.user_name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone_number", formData.phone_number);

      // Only append image if it's a file
      if (formData.profile_image instanceof File) {
        formDataToSend.append("profile_image", formData.profile_image);
      }

      const res = await fetch(
        `${CONFIG.API_BASE_URL}/enduser/${user.user_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (res.ok) {
        alert("User updated!");
        setActiveTab("profile");
      } else {
        const err = await res.json();
        console.error(err);
        alert("Error: " + (err.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="profile-page">
      <div className="container pt-5">
        <div className=" row">

          {/* SIDEBAR */}
          <div className="col-md-3">
            <div className="sidebar p-3 shadow rounded bg-light d-flex flex-column" >

              {/* Top Section */}
              <div>
                <a
                  href="/"
                  className="d-flex align-items-center mb-3 text-decoration-none"
                >
                  <i className="bi bi-person me-2 fs-2"></i> &nbsp;
                  <span className="fs-4 text-capitalize">{activeTab}</span>
                </a>

                <hr />

                <ul className="nav nav-pills flex-column">

                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
                      onClick={() => setActiveTab("profile")}
                    >
                      <i className="bi bi-person-fill me-2"></i> Profile
                    </button>
                  </li>

                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "bookings" ? "active" : ""}`}
                      onClick={() => setActiveTab("bookings")}
                    >
                      <i className="bi bi-ticket-fill me-2"></i> Bookings
                    </button>
                  </li>

                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "wallet" ? "active" : ""}`}
                      onClick={() => setActiveTab("wallet")}
                    >
                      <i className="bi bi-credit-card-fill me-2"></i> Wallet / Cards
                    </button>
                  </li>

                </ul>
              </div>

              {/* Bottom Section */}
              <div className="mt-auto">
                <hr />
                <button
                  className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </div>

            </div>
          </div>


          {/* CONTENT */}
          <div className="col-md-9">

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="profile-card text-center p-4 shadow rounded">
                {endUser.map((eu) => (
                  <div key={eu.user_id} className="profile-card text-center p-4 shadow rounded">

                    <div className="avatar mb-3 d-flex justify-content-center">
                      {eu.profile_image && eu.profile_image !== "0" ? (
                        <img
                          src={eu.profile_image}
                          alt="Profile"
                          className="profile-img"
                        />
                      ) : (
                        <div className="avatar-circle">
                          {eu.user_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <h4 className="fw-bold">
                      <i className="bi bi-person me-2"></i>
                      {eu.user_name}
                    </h4>

                    <p className="text-muted">
                      <i className="bi bi-envelope me-2"></i>
                      {eu.email}
                    </p>

                    <p className="text-muted">
                      <i className="bi bi-telephone me-2"></i>
                      {eu.phone_number}
                    </p>

                  </div>
                ))}


                <button className="btn btn-outline-primary w-100 mt-3" onClick={() => {
                  const userData = endUser[0]; // get first object
                  setFormData({
                    user_id: userData.user_id,
                    user_name: userData.user_name,
                    email: userData.email,
                    phone_number: userData.phone_number,
                    profile_image: userData.profile_image,
                  });
                  setActiveTab("editProfile");
                }}>
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit Profile
                </button>

              </div>
            )}

            {/* EDIT PROFILE */}
            {activeTab === "editProfile" && (
              <div className="card shadow p-4">
                <h4 className="mb-4 text-center justify-content-center">Edit Profile</h4>
                <hr className="p-1" />
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label>Name</label>
                    <input
                      type="text"
                      name='user_name'
                      className="form-control"
                      value={formData.user_name || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label>Email</label>
                    <input
                      type="email"
                      name='email'
                      className="form-control"
                      value={formData.email || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label>Phone</label>
                    <input
                      type="text"
                      name='phone_number'
                      className="form-control"
                      value={formData.phone_number || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label >Profile Image</label>
                    <input
                      type="file"
                      name="profile_image"
                      className="form-control"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile_image: e.target.files[0],
                        })
                      }
                    />
                    {formData.profile_image && (
                      <div className="mt-2 text-center">
                        <img
                          src={
                            typeof formData.profile_image === "string"
                              ? formData.profile_image   // old image URL
                              : URL.createObjectURL(formData.profile_image) // new file preview
                          }
                          alt="Preview"
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid #302b2b18'
                          }}
                        />
                      </div>
                    )}

                  </div>

                  <button className="btn btn-success w-100">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* BOOKINGS */}
            {activeTab === "bookings" && (
              <div className="card shadow p-4">
                <h4>My Bookings</h4>

                {bookings.length === 0 ? (
                  <>
                    <p>No bookings found.</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => window.location.href = "/"}
                    >
                      Go To Home
                    </button>
                  </>
                ) : (
                  bookings.map((b) => (
                    <div key={b._id} className="border p-3 mb-2 rounded">
                      {b.from} → {b.to}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* WALLET */}
            {activeTab === "wallet" && (
              <div className="card shadow p-4">

                <h4 className="mb-3">Wallet Balance</h4>
                <h3 className="text-success">₹ {endUser.wallet_balance || 0}</h3>

                <hr />

                <button
                  className="btn btn-primary mb-3"
                  onClick={() => setPaymentType("select")}
                >
                  Add Payment Method
                </button>

                {paymentType === "select" && (
                  <select
                    className="form-select mb-3"
                    onChange={(e) => setPaymentType(e.target.value)}
                  >
                    <option value="">Select Method</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="upiid">UPI ID</option>
                    <option value="upiapp">UPI App</option>
                    <option value="card">Debit/Credit Card</option>
                  </select>
                )}

                {/* BANK FORM */}
                {paymentType === "bank" && (
                  <div>
                    <input className="form-control mb-2" placeholder="Account Number" />
                    <input className="form-control mb-2" placeholder="IFSC Code" />
                    <button className="btn btn-success w-100">Save Bank</button>
                  </div>
                )}

                {/* UPI ID */}
                {paymentType === "upiid" && (
                  <div>
                    <input className="form-control mb-2" placeholder="Enter UPI ID" />
                    <button className="btn btn-success w-100">Save UPI</button>
                  </div>
                )}

                {/* UPI APP */}
                {paymentType === "upiapp" && (
                  <div>
                    <select className="form-select mb-2">
                      <option>Google Pay</option>
                      <option>PhonePe</option>
                      <option>Paytm</option>
                    </select>
                    <button className="btn btn-success w-100">Save App</button>
                  </div>
                )}

                {/* CARD */}
                {paymentType === "card" && (
                  <div>
                    <input className="form-control mb-2" placeholder="Card Number" />
                    <input className="form-control mb-2" placeholder="Expiry Date" />
                    <input className="form-control mb-2" placeholder="CVV" />
                    <button className="btn btn-success w-100">Save Card</button>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </div>

  );
}

export default Profile;
