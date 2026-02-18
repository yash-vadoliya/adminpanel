import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import { Eye, EyeSlash, PencilSquare } from "react-bootstrap-icons";

function AddUser() {
  const { token, user } = useContext(AuthContext);

  const [showForm, setShowForm] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  const [showAddPass, setShowAddPass] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Added for searching

  // ✅ Roles
  const ROLES = [
    { id: 1, name: "SUPER_ADMIN" },
    { id: 2, name: "ADMIN" },
    { id: 3, name: "MANAGER" },
    { id: 4, name: "TRAVEL_MANAGER" },
    { id: 5, name: "OPERATOR" },
    { id: 6, name: "END_USER" },
  ];

  // ✅ Add/Edit User form
  const [formData, setFormData] = useState({
    travel_id: "",
    user_name: "",
    password: "",
    role_id: "",
    user_role: "",
    email: "",
    adduid: "",
  });

  // ✅ Change Password form
  const [passForm, setPassForm] = useState({
    user_id: "",
    password: "",
  });

  // ✅ Fetch users and travels
  useEffect(() => {
    fetchUser();
    fetchTravel();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      setData(result[0] || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTravel = async () => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/travel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      setTravels(result[0] || []);
    } catch (err) {
      console.error("Error fetching travels:", err);
    }
  };

  // ✅ Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "role_id") {
      const selectedRole = ROLES.find((r) => r.id === parseInt(value));
      setFormData({
        ...formData,
        role_id: value,
        user_role: selectedRole ? selectedRole.name : "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Add / Edit Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        adduid: user?.user_id || null
      };

      if (editMode && (!formData.password || formData.password.trim() === "")) {
      delete payload.password;
    }

      const method = editMode ? "PUT" : "POST";
      const url = editMode
        ? `${CONFIG.API_BASE_URL}/user/${formData.user_id}`
        : `${CONFIG.API_BASE_URL}/user`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || (editMode ? "User updated!" : "User added!"));
        handleCloseForm();
        fetchUser();
      } else {
        alert(result.error || "Failed to save user.");
      }
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };


  // ✅ Edit User
  const handleEdit = (item) => {
    setShowForm(true);
    setShowPassForm(false);
    setEditMode(true);
    setFormData({
      user_id: item.user_id,
      travel_id: item.travel_id,
      user_name: item.user_name,
      password: "",
      role_id: item.role_id,
      user_role: item.user_role,
      email: item.email,
      adduid: item.adduid,
    });
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    const res = await fetch(
      `${CONFIG.API_BASE_URL}/user/${id}?deleteuid=${user?.user_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();

    if (res.ok) {
      alert(result.message || "User deleted successfully!");
      fetchUser();
    } else {
      alert(result.error || "Failed to delete user.");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
  }
};


  // ✅ Password change handlers
  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassForm({ ...passForm, [name]: value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passForm.user_id || !passForm.password) {
      alert("Please select a user and enter a password!");
      return;
    }

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/user/${passForm.user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passForm.password }),
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message || "Password updated!");
        setPassForm({ user_id: "", password: "" });
        setShowPassForm(false);
      } else {
        alert(result.error || "Failed to update password.");
      }
    } catch (err) {
      console.error("Error updating password:", err);
    }
  };

  // ✅ Close form and reset state
  const handleCloseForm = () => {
    setShowForm(false);
    setEditMode(false);
    setFormData({
      user_id: "",
      travel_id: "",
      user_name: "",
      password: "",
      role_id: "",
      user_role: "",
      email: "",
      adduid: "",
    });
  };

  // ✅ Filter users based on search term
  const filteredUsers = data.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.user_name?.toLowerCase().includes(search) ||
      item.user_id?.toString().includes(search)
    );
  });

  return (
    <>
      {/* Header Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Users</h2>
        <div>
          <button
            className="btn btn-success me-3"
            onClick={() => {
              setShowForm(!showForm);
              setShowPassForm(false);
              if (!showForm) setEditMode(false);
            }}
          >
            {showForm ? "Close" : "Add User"}
          </button>

          {user?.role_id === 1 && (
            <button
              className="btn btn-warning"
              onClick={() => {
                setShowPassForm(!showPassForm);
                setShowForm(false);
              }}
            >
              {showPassForm ? "Close" : "Set User Password"}
            </button>
          )} 
        </div>
      </div>

      {/* ✅ Search Box */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by User ID or User Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ✅ Add/Edit User Form */}
      {showForm && (
        <div className="card mb-3 shadow p-3">
          <h5 className="mb-3">{editMode ? "Edit User" : "Add New User"}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <select
                  name="travel_id"
                  className="form-control"
                  value={formData.travel_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Travel</option>
                  {travels.map((t) => (
                    <option key={t.travel_id} value={t.travel_id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <input
                  type="text"
                  name="user_name"
                  className="form-control"
                  placeholder="User Name"
                  value={formData.user_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {!editMode && (
                <div className="col-md-4 position-relative">
                  <input
                    type={showAddPass ? "text" : "password"}
                    name="password"
                    className="form-control"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="position-absolute top-50 end-0 translate-middle-y me-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowAddPass(!showAddPass)}
                  >
                    {showAddPass ? <EyeSlash /> : <Eye />}
                  </span>
                </div>
              )}

              <div className="col-md-4">
                <select
                  name="role_id"
                  className="form-control"
                  value={formData.role_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  {ROLES.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mt-3">
              <div className="col-md-4 d-flex align-items-end">
                <button type="submit" className="btn btn-primary me-2">
                  {editMode ? "Update" : "Save"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCloseForm}>
                  Close
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ✅ Change Password Form */}
      {showPassForm && (
        <div className="card mb-3 shadow p-3">
          <h5 className="mb-3">Change Password</h5>
          <form onSubmit={handlePasswordSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <select
                  name="user_id"
                  className="form-control"
                  value={passForm.user_id}
                  onChange={handlePassChange}
                  required
                >
                  <option value="">Select User</option>
                  {data.map((item) => (
                    <option key={item.user_id} value={item.user_id}>
                      {item.user_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4 position-relative">
                <input
                  type={showChangePass ? "text" : "password"}
                  name="password"
                  className="form-control"
                  placeholder="New Password"
                  value={passForm.password}
                  onChange={handlePassChange}
                  required
                />
                <span
                  className="position-absolute top-50 end-0 translate-middle-y me-3"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowChangePass(!showChangePass)}
                >
                  {showChangePass ? <EyeSlash /> : <Eye />}
                </span>
              </div>
            </div>

            <div className="row g-3 mt-3">
              <div className="col-md-4 d-flex align-items-end">
                <button type="submit" className="btn btn-primary me-2">
                  Update Password
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPassForm(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ✅ User Table */}
      <div style={{ maxHeight: "80vh", overflow: "auto" }}>
        <div className="table-responsive">
          <table className="table table-bordered text-center shadow-sm rounded-3">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>TRAVEL</th>
                <th>USER NAME</th>
                <th>ROLE</th>
                <th>EMAIL</th>
                <th>ADD UID</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "#fff" }}>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7">No users found</td>
                </tr>
              ) : (
                filteredUsers
                 .filter((item) => item.record_status === 1)
                .map((item) => (
                  <tr key={item.user_id}>
                    <td>{item.user_id}</td>
                    <td>{travels.find((t) => t.travel_id === item.travel_id)?.name || "-"}</td>
                    <td>{item.user_name}</td>
                    <td>{item.user_role || item.role_id}</td>
                    <td>{item.email}</td>
                    <td>{item.adduid}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info me-2"
                        onClick={() => handleEdit(item)}
                      >
                        <PencilSquare /> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item.user_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AddUser;
