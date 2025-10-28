import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import Pagination from "../components/Pagination";
import { PencilSquare, Trash, Eye } from "react-bootstrap-icons";
import "../App.css";

function Driver() {
  const { token, user } = useContext(AuthContext);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showForm, setShowForm] = useState(false);
  const [selectDriver, setSelectDriver] = useState(null);
  const [editID, setEditID] = useState(null);

  const [formData, setFormData] = useState({
    driver_id: "",
    vehicle_id: "",
    driver_name: "",
    driver_vehicle_number: "",
    driver_licence_number: "",
    email: "",
    driver_phone_number: "",
    gender: "",
    date_of_birth: "",
    city_id: "",
    current_latitude: "",
    current_longitude: "",
    total_trips: "",
    wallet_balance: "",
    active_status: "",
    image_of_licence: "",
    driver_image: "",
    adduid: user?.user_id || "",
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/driver`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDrivers(data[0] || []);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      driver_id: "",
      vehicle_id: "",
      driver_name: "",
      driver_vehicle_number: "",
      driver_licence_number: "",
      email: "",
      driver_phone_number: "",
      gender: "",
      date_of_birth: "",
      city_id: "",
      current_latitude: "",
      current_longitude: "",
      total_trips: "",
      wallet_balance: "",
      active_status: "",
      image_of_licence: "",
      driver_image: "",
      adduid: user?.user_id || "",
    });
    setEditID(null);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      const url = editID
        ? `${CONFIG.API_BASE_URL}/driver/${editID}`
        : `${CONFIG.API_BASE_URL}/driver`;
      const method = editID ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (res.ok) {
        alert(editID ? "Driver updated successfully!" : "Driver added successfully!");
        fetchDrivers();
        setShowForm(false);
      } else {
        const err = await res.json();
        alert("Error: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  const handleEdit = (driver) => {
    const { adduid, adddate, deleteuid, deletedate, record_status, created_at, updated_at, ...rest } = driver;
    setFormData({ ...rest, adduid: user?.user_id || "" });
    setEditID(driver.driver_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/driver/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchDrivers();
    } catch (err) {
      console.error("Error deleting driver:", err);
    }
  };

  const filteredDrivers = drivers;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredDrivers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Driver</h2>
        <button className="btn btn-success" onClick={handleAdd}>
          Add Driver
        </button>
      </div>

      {showForm && (
        <div className="card p-3 shadow">
          <h5>{editID ? "Update Driver" : "Add Driver"}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              {[
                ["vehicle_id", "Vehicle ID", "text"],
                ["driver_name", "Driver Name", "text"],
                ["driver_vehicle_number", "Vehicle Number", "text"],
                ["driver_licence_number", "Licence Number", "text"],
                ["email", "Email", "email"],
                ["driver_phone_number", "Phone Number", "text"],
                ["gender", "Gender", "text"],
                ["date_of_birth", "Date of Birth", "date"],
                ["city_id", "City ID", "text"],
                ["current_latitude", "Latitude", "text"],
                ["current_longitude", "Longitude", "text"],
                ["total_trips", "Total Trips", "text"],
                ["wallet_balance", "Wallet Balance", "text"],
                ["active_status", "Status", "text"],
              ].map(([name, label, type]) => (
                <div className="col-md-4 mb-2" key={name}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    name={name}
                    className="form-control"
                    value={formData[name]}
                    onChange={handleChange}
                  />
                </div>
              ))}

              <div className="col-md-4 mb-2">
                <label className="form-label">Licence Image</label>
                <input type="file" name="image_of_licence" className="form-control" onChange={handleChange} />
                {formData.image_of_licence && typeof formData.image_of_licence === "object" && (
                  <img
                    src={URL.createObjectURL(formData.image_of_licence)}
                    alt="Licence Preview"
                    className="img-thumbnail mt-2"
                    style={{ maxHeight: "150px" }}
                  />
                )}
              </div>

              <div className="col-md-4 mb-2">
                <label className="form-label">Driver Image</label>
                <input type="file" name="driver_image" className="form-control" onChange={handleChange} />
                {formData.driver_image && typeof formData.driver_image === "object" && (
                  <img
                    src={URL.createObjectURL(formData.driver_image)}
                    alt="Driver Preview"
                    className="img-thumbnail mt-2"
                    style={{ maxHeight: "150px" }}
                  />
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary me-2">
              {editID ? "Update" : "Add"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="table-responsive">
        {loading ? (
          <p className="text-center fs-5">Loading Drivers...</p>
        ) : (
          <table className="table table-bordered table-hover text-center align-middle fs-6">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Vehicle ID</th>
                <th>Driver Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((d) => (
                  <tr key={d.driver_id}>
                    <td>{d.driver_id}</td>
                    <td>{d.vehicle_id}</td>
                    <td>{d.driver_name}</td>
                    <td>{d.email}</td>
                    <td>{d.driver_phone_number}</td>
                    <td>
                      {d.active_status === 1 ? (
                        <span className="badge bg-success px-3 py-2">Active</span>
                      ) : (
                        <span className="badge bg-danger px-3 py-2">Inactive</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-info btn-sm me-2" onClick={() => setSelectDriver(d)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(d)}>
                        <PencilSquare size={16} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.driver_id)}>
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No drivers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectDriver && (
        <>
          <div className="details-overlay" onClick={() => setSelectDriver(null)}></div>
          <div className="details-panel show">
            <div className="card shadow-lg">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-center flex-grow-1 fs-3">Driver Details</h5>
                <button className="btn btn-light btn-sm" onClick={() => setSelectDriver(null)}>
                  ❌
                </button>
              </div>
              <div className="card-body fs-6">
                <div className="row g-3 mb-3">
                  <div className="col-md-6"><strong>Driver ID:</strong> {selectDriver.driver_id}</div>
                  <div className="col-md-6"><strong>Vehicle ID:</strong> {selectDriver.vehicle_id}</div>
                  <div className="col-md-6"><strong>Driver Vehicle Number:</strong> {selectDriver.driver_vehicle_number}</div>
                  <div className="col-md-6"><strong>Licence Number:</strong> {selectDriver.driver_licence_number}</div>
                  <div className="col-md-6"><strong>Email:</strong> {selectDriver.email}</div>
                  <div className="col-md-6"><strong>Phone:</strong> {selectDriver.driver_phone_number}</div>
                  <div className="col-md-6"><strong>Gender:</strong> {selectDriver.gender}</div>
                  <div className="col-md-6"><strong>DOB:</strong> {selectDriver.date_of_birth}</div>
                  <div className="col-md-6"><strong>City ID:</strong> {selectDriver.city_id}</div>
                  <div className="col-md-6"><strong>Latitude:</strong> {selectDriver.current_latitude}</div>
                  <div className="col-md-6"><strong>Longitude:</strong> {selectDriver.current_longitude}</div>
                  <div className="col-md-6"><strong>Total Trips:</strong> {selectDriver.total_trips}</div>
                  <div className="col-md-6"><strong>Wallet Balance:</strong> {selectDriver.wallet_balance}</div>
                  <div className="col-md-6"><strong>Status:</strong>{" "}
                    {selectDriver.active_status === 1 ? (
                      <span className="badge bg-success px-3 py-2">Active</span>
                    ) : (
                      <span className="badge bg-danger px-3 py-2">Inactive</span>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 text-center">
                    <h6>Licence Image</h6>
                    {selectDriver.image_of_licence ? (
                      <a href={selectDriver.image_of_licence} target="_blank" rel="noopener noreferrer">
                        <img
                          src={selectDriver.image_of_licence}
                          alt="Licence"
                          className="img-fluid rounded shadow-sm"
                          style={{ maxHeight: "250px", objectFit: "cover" }}
                        />
                      </a>
                    ) : (
                      <p>No licence image available</p>
                    )}
                  </div>

                  <div className="col-md-6 text-center">
                    <h6>Driver Image</h6>
                    {selectDriver.driver_image ? (
                      <a href={selectDriver.driver_image} target="_blank" rel="noopener noreferrer">
                        <img
                          src={selectDriver.driver_image}
                          alt="Driver"
                          className="img-fluid rounded shadow-sm"
                          style={{ maxHeight: "250px", objectFit: "cover" }}
                        />
                      </a>
                    ) : (
                      <p>No driver image available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={filteredDrivers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default Driver;
