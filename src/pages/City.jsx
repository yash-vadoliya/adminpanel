import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import { PencilSquare, Trash } from "react-bootstrap-icons";
import Pagination from '../components/Pagination';


function City() {
  const { token, user } = useContext(AuthContext);

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // rows per page
  const [statusFilter, setStatusFilter] = useState('');


  const [formData, setFormData] = useState({
    city_id: "",
    city_name: "",
    state_name: "",
    country_name: "India",
    latitude: "",
    longitude: "",
    travel_id: user?.travel_id || "",
    adduid: user?.user_id || "",
  });

  // ------------------- FETCH CITIES -------------------
  const fetchCities = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_BASE_URL}/city`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      console.log(result);
      setCities(result[0] || []);
    } catch (err) {
      console.error("Error fetching cities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  // ------------------- HANDLE INPUT -------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ------------------- ADD / EDIT SUBMIT -------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editMode ? "PUT" : "POST";
      const url = editMode
        ? `${CONFIG.API_BASE_URL}/city/${formData.city_id}`
        : `${CONFIG.API_BASE_URL}/city`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        alert(editMode ? "City updated!" : "City added!");
        handleCloseForm();
        fetchCities();
      } else {
        alert(result.error || "Failed to save city.");
      }
    } catch (err) {
      console.error("Error saving city:", err);
    }
  };

  // ------------------- EDIT -------------------
  const handleEdit = (item) => {
    setShowForm(true);
    setEditMode(true);
    setFormData({
      city_id: item.city_id,
      city_name: item.city_name,
      state_name: item.state_name,
      country_name: item.country_name,
      latitude: item.latitude,
      longitude: item.longitude,
      travel_id: item.travel_id,
      adduid: item.adduid,
    });
  };

  // ------------------- DELETE -------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this city?")) return;

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/city/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (res.ok) {
        alert("City deleted!");
        fetchCities();
      } else {
        alert(result.error || "Failed to delete.");
      }
    } catch (err) {
      console.error("Error deleting city:", err);
    }
  };

  // ------------------- CLOSE FORM -------------------
  const handleCloseForm = () => {
    setShowForm(false);
    setEditMode(false);
    setFormData({
      city_id: "",
      city_name: "",
      state_name: "",
      country_name: "India",
      latitude: "",
      longitude: "",
      travel_id: user?.travel_id || "",
      adduid: user?.user_id || "",
    });
  };

  // ------------------- FILTER FOR SEARCH -------------------
  const filteredCities = cities.filter((c) =>
    c.city_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredData = cities
    .filter(c => c.record_status === 1)
    .filter(c =>
      c.city_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(c => (statusFilter ? c.status === statusFilter : true));


  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>City Master</h2>
        <button
          className="btn btn-success"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) setEditMode(false);
          }}
        >
          {showForm ? "Close" : "Add City"}
        </button>
      </div>

      {/* Search box */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card p-3 shadow mb-3">
          <h5>{editMode ? "Edit City" : "Add New City"}</h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  name="city_name"
                  className="form-control"
                  placeholder="City Name"
                  value={formData.city_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <input
                  type="text"
                  name="state_name"
                  className="form-control"
                  placeholder="State Name"
                  value={formData.state_name}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <input
                  type="text"
                  name="country_name"
                  className="form-control"
                  placeholder="Country"
                  value={formData.country_name}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <input
                  type="text"
                  name="latitude"
                  className="form-control"
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <input
                  type="text"
                  name="longitude"
                  className="form-control"
                  placeholder="Longitude"
                  value={formData.longitude}
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

      {/* Table */}
      <div style={{ maxHeight: "80vh", overflow: "auto" }}>
        <table className="table table-bordered text-center shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>CITY</th>
              <th>STATE</th>
              <th>COUNTRY</th>
              <th>LAT</th>
              <th>LONG</th>
              <th>ADD UID</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">Loading...</td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan="8">No cities found</td>
              </tr>
            ) : (
              currentData.map((c) => (
                <tr key={c.city_id}>
                  <td>{c.city_id}</td>
                  <td>{c.city_name}</td>
                  <td>{c.state_name || "-"}</td>
                  <td>{c.country_name}</td>
                  <td>{c.latitude || "-"}</td>
                  <td>{c.longitude || "-"}</td>
                  <td>{c.adduid}</td>

                  <td>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => handleEdit(c)}
                    >
                      <PencilSquare /> Edit
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(c.city_id)}
                    >
                      <Trash /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />

      </div>
    </>
  );
}

export default City;
