import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import { PencilSquare } from "react-bootstrap-icons";

function TravelMaster() {
  const { token, user } = useContext(AuthContext);

  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    travel_id: "",
    name: "",
    mobile: "",
    logo: "",
    adduid: user?.user_id || "",
  });

  // ✅ Fetch all travels
  const fetchTravels = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_BASE_URL}/travel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      setTravels(result[0] || []);
    } catch (err) {
      console.error("Error fetching travels:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravels();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo" && files?.[0]) {
      setFormData({ ...formData, logo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Add or Edit Submit
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //       const payload = { ...formData, adduid: user?.user_id || null }

  //     const method = editMode ? "PUT" : "POST";
  //     const url = editMode
  //       ? `${CONFIG.API_BASE_URL}/travel/${formData.travel_id}`
  //       : `${CONFIG.API_BASE_URL}/travel`;

  //     const res = await fetch(url, {
  //       method,
  //       headers: { Authorization: `Bearer ${token}` },
  //       body: JSON.stringify(payload),
  //     });

  //     const result = await res.json();

  //     if (res.ok) {
  //       alert(result.message || (editMode ? "Travel updated!" : "Travel added!"));
  //       handleCloseForm();
  //       fetchTravels();
  //     } else {
  //       alert(result.error || "Failed to save travel data.");
  //     }
  //   } catch (err) {
  //     console.error("Error saving travel:", err);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("mobile", formData.mobile);
    formDataToSend.append("adduid", user?.user_id || "");
    if (formData.logo instanceof File) {
      formDataToSend.append("logo", formData.logo);
    }

    const method = editMode ? "PUT" : "POST";
    const url = editMode
      ? `${CONFIG.API_BASE_URL}/travel/${formData.travel_id}`
      : `${CONFIG.API_BASE_URL}/travel`;

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formDataToSend, // ✅ NO JSON.stringify
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message || (editMode ? "Travel updated!" : "Travel added!"));
      handleCloseForm();
      fetchTravels();
    } else {
      alert(result.error || "Failed to save travel data.");
    }
  } catch (err) {
    console.error("Error saving travel:", err);
  }
};


  // ✅ Edit Travel
  const handleEdit = (item) => {
    setShowForm(true);
    setEditMode(true);
    setFormData({
      travel_id: item.travel_id,
      name: item.name,
      mobile: item.mobile,
      logo: "",
      adduid: item.adduid,
    });
  };

  // ✅ Delete Travel
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this travel agency?")) return;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/travel/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message || "Travel deleted successfully!");
        fetchTravels();
      } else {
        alert(result.error || "Failed to delete travel.");
      }
    } catch (err) {
      console.error("Error deleting travel:", err);
    }
  };

  // ✅ Close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditMode(false);
    setFormData({
      travel_id: "",
      name: "",
      mobile: "",
      logo: "",
      adduid: user?.user_id || "",
    });
  };

  // ✅ Filtered search
  const filteredTravels = travels.filter((t) =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Travel Agency</h2>
        <button
          className="btn btn-success"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) setEditMode(false);
          }}
        >
          {showForm ? "Close" : "Add Travel"}
        </button>
      </div>

      {/* Search box */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by travel name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ✅ Add/Edit Form */}
      {showForm && (
        <div className="card p-3 shadow mb-3">
          <h5>{editMode ? "Edit Travel Agency" : "Add New Travel Agency"}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Agency Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  name="mobile"
                  className="form-control"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="file"
                  name="logo"
                  className="form-control"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-3 d-flex">
              <button type="submit" className="btn btn-primary me-2">
                {editMode ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ✅ Table */}
      <div style={{ maxHeight: "80vh", overflow: "auto" }}>
        <div className="table-responsive">
          <table className="table table-bordered text-center shadow-sm rounded-3">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>LOGO</th>
                <th>NAME</th>
                <th>MOBILE</th>
                <th>ADD UID</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading...</td>
                </tr>
              ) : filteredTravels.length === 0 ? (
                <tr>
                  <td colSpan="6">No travel agencies found</td>
                </tr>
              ) : (
                filteredTravels.map((t) => (
                  <tr key={t.travel_id}>
                    <td>{t.travel_id}</td>
                    <td>
                      {t.logo ? (
                        <img
                          src={t.logo}
                          alt="Logo"
                          width="60"
                          height="60"
                          style={{ objectFit: "contain" }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{t.name}</td>
                    <td>{t.mobile}</td>
                    <td>{t.adduid}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info me-2"
                        onClick={() => handleEdit(t)}
                      >
                        <PencilSquare /> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(t.travel_id)}
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

export default TravelMaster;
