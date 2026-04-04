import React, { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import Pagination from "../components/Pagination";
import { PencilSquare, Trash, Eye } from "react-bootstrap-icons";
import "../App.css";
import MapPicker from "../components/MapPicker";
import useCity from "../Hooks/useCities";
import useVehicles from '../Hooks/useVehicles';
import useDrivers from "../Hooks/useDriver";

function Driver() {
  const { token, user } = useContext(AuthContext);

  // const [drivers, setDrivers] = useState([]);
  // const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editID, setEditID] = useState(null);
  const [selectDriver, setSelectDriver] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { city, fetchCity } = useCity();
  const { vehicles, fetchVehicles } = useVehicles();
  const { drivers, fetchDrivers } = useDrivers(token);

  // FORM DATA
  const [formData, setFormData] = useState({
    driver_name: "",
    vehicles_id: "",
    driver_vehicle_number: "",
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
    adduid: user?.user_id || "",
  });

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
    fetchCity();
  }, []);

  // ADD BUTTON
  const handleAdd = () => {
    setFormData({
      driver_name: "",
      vehicles_id: "",
      driver_vehicle_number: "",
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
      adduid: user?.user_id || "",
    });
    setEditID(null);
    setShowForm(true);
  };

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // SUBMIT CREATE / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...formData, adduid: user?.user_id || null };

    try {
      const url = editID
        ? `${CONFIG.API_BASE_URL}/driver/${editID}`
        : `${CONFIG.API_BASE_URL}/driver`;

      const method = editID ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong");
        return;
      }

      alert(editID ? "Driver updated successfully" : "Driver added successfully");
      setShowForm(false);
      fetchDrivers();

    } catch (err) {
      console.error("Submit Error:", err);
      alert("Error submitting form");
    }
  };



  // EDIT DRIVER
  const handleEdit = (driver) => {
    setFormData({
      driver_name: driver.driver_name || "",
      vehicles_id: driver.vehicles_id || "",
      driver_vehicle_number: driver.driver_vehicle_number || "",
      email: driver.email || "",
      driver_phone_number: driver.driver_phone_number || "",
      gender: driver.gender || "",
      date_of_birth: driver.date_of_birth || "",
      city_id: driver.city_id || "",
      current_latitude: driver.current_latitude || "",
      current_longitude: driver.current_longitude || "",
      total_trips: driver.total_trips || "",
      wallet_balance: driver.wallet_balance || "",
      active_status: driver.active_status || "",
      adduid: user?.user_id || "",
    });

    setEditID(driver.driver_id);
    setShowForm(true);
  };

  // DELETE DRIVER
  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this?")) return;

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/driver/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) fetchDrivers();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  // MAP PICKER
  const onLocationChange = useCallback((location) => {
    setFormData((prev) => ({
      ...prev,
      current_latitude: location.lat,
      current_longitude: location.lng,
    }));
  }, []);

  // GET MAX DATE OF BIRTH FOR DRIVER
  const getMaxDOB = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split("T")[0];
  };


  // PAGINATION
  const filteredDrivers = drivers.filter((d) => d.record_status !== 0); // Assuming 0 is deleted
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredDrivers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3 mt-3">
        <h2>Driver Management</h2>
        <button className="btn btn-success" onClick={handleAdd}>
          + Add Driver
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card p-3 shadow mb-4">
          <h4 className="mb-3">{editID ? "Update Driver" : "Add New Driver"}</h4>

          <form onSubmit={handleSubmit}>
            <div className="row">

              <div className="col-md-4 mb-2">
                <label className="form-label">Driver Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="driver_name"
                  value={formData.driver_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-2">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-2">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  name="driver_phone_number"
                  value={formData.driver_phone_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-2">
                <label className="form-label">Gender</label>
                <select
                  className="form-control"
                  name="gender"
                  isSearchable
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div className="col-md-4 mb-2">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  max={getMaxDOB()}
                  onChange={handleChange}
                />
              </div>

              {/* VEHICLE DROPDOWN */}
              <div className="col-md-4 mb-2">
                <label className="form-label">Select Vehicle</label>
                <select
                  name="vehicles_id"
                  className="form-control"
                  isSearchable
                  value={formData.vehicles_id}
                  onChange={(e) => {
                    const selectedVehicle = vehicles.find(
                      (v) => String(v.vehicles_id) === e.target.value
                    );

                    setFormData((prev) => ({
                      ...prev,
                      vehicles_id: e.target.value,
                      driver_vehicle_number: selectedVehicle?.vehicles_number || "",
                    }));
                  }}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.vehicles_id} value={v.vehicles_id}>
                      {v.vehicles_name} ({v.vehicles_number})
                    </option>
                  ))}
                </select>

              </div>

              {/* VEHICLE NUMBER */}
              <div className="col-md-4 mb-2">
                <label className="form-label">Vehicle Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="driver_vehicle_number"
                  value={formData.driver_vehicle_number}
                  readOnly
                />
              </div>

              <div className="col-md-4 mb-2">
                <label className="form-label">Total Trips</label>
                <input
                  type="number"
                  className="form-control"
                  name="total_trips"
                  value={formData.total_trips}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-2">
                <label className="form-label">Wallet Balance</label>
                <input
                  type="number"
                  className="form-control"
                  name="wallet_balance"
                  value={formData.wallet_balance}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-2">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  name="active_status"
                  value={formData.active_status}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>
                  <option value="1 ">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>

              {/* CITY DROPDOWN */}
              <div className="col-md-4 mb-2">
                <label className="form-label">Select City</label>
                <select
                  name="city_id"
                  value={formData.city_id}
                  className="form-control"
                  onChange={handleChange}
                >
                  <option value="">Select City</option>
                  {city.map((c) => (
                    <option key={c.city_id} value={c.city_id}>
                      {c.city_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* MAP PICKER */}
              <div className="col-md-12 mt-3">
                <label className="form-label fw-bold">Select Driver Location</label>
                <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <MapPicker
                    latitude={formData.current_latitude}
                    longitude={formData.current_longitude}
                    onLocationChange={onLocationChange}
                  />
                  <div className="mt-2 text-muted small">
                    <b>Lat:</b> {formData.current_latitude || 'N/A'} | <b>Lng:</b> {formData.current_longitude || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="btn btn-primary me-2">
                {editID ? "Update Driver" : "Save Driver"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DATA TABLE */}
      <div className="table-responsive mt-3 shadow-sm bg-white p-2 rounded">
        <table className="table table-striped table-hover align-middle text-center">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Vehicle No</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Trips</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentData && currentData.length > 0 ? (
              currentData.map((d) => (
                <tr key={d.driver_id}>
                  <td>{d.driver_id}</td>
                  <td>{d.driver_name}</td>
                  <td>{d.driver_vehicle_number}</td>
                  <td>{d.email}</td>
                  <td>{d.driver_phone_number}</td>
                  <td>{d.total_trips}</td>

                  <td>
                    {Number(d.active_status) === 1 ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-danger">Inactive</span>
                    )}
                  </td>

                  <td>
                    <button
                      className="btn btn-info btn-sm me-2"
                      onClick={() => setSelectDriver(d)}
                      title="View"
                    >
                      <Eye />
                    </button>

                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(d)}
                      title="Edit"
                    >
                      <PencilSquare />
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(d.driver_id)}
                      title="Delete"
                    >
                      <Trash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No Drivers Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={filteredDrivers.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* VIEW DETAILS PANEL */}
      {selectDriver && (
        <>
          {/* Overlay */}
          <div
            className="details-overlay"
            onClick={() => setSelectDriver(null)}
          ></div>

          {/* Side Panel */}
          <div className="details-panel show">
            <div className="card shadow-lg">

              {/* Header */}
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-center flex-grow-1 fs-3">
                  Driver Details
                </h5>
                <button
                  className="btn btn-light btn-sm"
                  onClick={() => setSelectDriver(null)}
                >
                  ✖
                </button>
              </div>

              {/* Body */}
              <div className="card-body fs-6">

                {/* Basic Info */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <strong className="text-success">Driver ID:</strong> {selectDriver.driver_id}
                  </div>
                  <div className="col-md-6">
                    <strong className="text-success">Name:</strong> {selectDriver.driver_name}
                  </div>
                  <div className="col-md-6">
                    <strong className="text-success">Email:</strong> {selectDriver.email}
                  </div>
                  <div className="col-md-6">
                    <strong className="text-success">Phone:</strong> {selectDriver.driver_phone_number}
                  </div>
                </div>

                <hr />

                {/* Vehicle & City */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <strong className="text-success">Vehicle Number:</strong><br />
                    {selectDriver.driver_vehicle_number}
                  </div>
                  <div className="col-md-6">
                    <strong className="text-success">City ID:</strong><br />
                    {selectDriver.city_id}
                  </div>
                </div>

                <hr />

                {/* Location */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <strong className="text-success">Latitude:</strong><br />
                    {selectDriver.current_latitude}
                  </div>
                  <div className="col-md-6">
                    <strong className="text-success">Longitude:</strong><br />
                    {selectDriver.current_longitude}
                  </div>
                </div>

                <hr />

                {/* Wallet & Trips */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <strong className="text-success">Wallet Balance:</strong><br />
                    ₹{selectDriver.wallet_balance}
                  </div>
                  <div className="col-md-6">
                    <strong className="text-success">Total Trips:</strong><br />
                    {selectDriver.total_trips}
                  </div>
                </div>

                <hr />

                {/* Status */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong className="text-success">Status:</strong><br />
                    {Number(selectDriver.active_status) === 1 ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-danger">Inactive</span>
                    )}
                  </div>
                </div>

                {/* Close Button */}
                <div className="d-flex justify-content-center mt-4">
                  <button
                    className="btn btn-secondary px-4"
                    onClick={() => setSelectDriver(null)}
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default Driver;