import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../AuthContext';
import CONFIG from '../Config';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import Pagination from '../components/Pagination';
import ROLES from '../Role';

function Vehicles() {
    const { token, user } = useContext(AuthContext);

    // States
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // rows per page
    const [file, setFile] = useState(null);
    const fileInputRef = useRef();

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        vehicles_type: '',
        brand: '',
        model_name: '',
        vehicles_number: '',
        vehicles_register_date: '',
        vehicles_condition: '',
        number_of_seats: '',
        number_of_doors: '',
        total_rows: '',
        total_columns: '',
        passenger_capacity: '',
        vehicle_image: '',
        status: 'Active',
    });

    // Role Base
    const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role_id);


    // Fetch vehicles
    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/vehicles`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const vehicles = await res.json();
            setData(vehicles[0] || []); // handle array in array
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

    };

    // Show form for Add
    const handleAdd = () => {
        setFormData({
            vehicles_type: '',
            brand: '',
            model_name: '',
            vehicles_number: '',
            vehicles_register_date: '',
            vehicles_condition: '',
            number_of_seats: '',
            number_of_doors: '',
            total_rows: '',
            total_columns: '',
            passenger_capacity: '',
            vehicle_image: '',
            status: '',
        });
        setEditId(null);
        setShowForm(true);
    };

    // Show form for Edit
    const handleEdit = (vehicle) => {
        const { adduid, adddate, deleteuid, deletedate, record_status, created_at, updated_at, ...rest } = vehicle;
        const formattedDate = vehicle.vehicles_register_date
            ? new Date(vehicle.vehicles_register_date).toISOString().split('T')[0]
            : '';

        setFormData({
            ...rest,
            vehicles_register_date: formattedDate, // ✅ correctly formatted for date input
        });
        setFile(null);
        setEditId(vehicle.vehicles_id);
        setShowForm(true);
    };

    // Delete vehicle
    const handleDelete = async (vehicles_id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/vehicles/${vehicles_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) fetchVehicles();
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        if (selectedFile) {
            // show preview for newly selected image
            const previewURL = URL.createObjectURL(selectedFile);
            setFormData(prev => ({ ...prev, vehicle_image: previewURL }));
        }
    };


    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = editId ? 'PUT' : 'POST';
        const url = editId
            ? `${CONFIG.API_BASE_URL}/vehicles/${editId}`
            : `${CONFIG.API_BASE_URL}/vehicles`;

        const form = new FormData();
        Object.keys(formData).forEach(key => {
            form.append(key, formData[key]);
        });
        form.append("adduid", String(user?.user_id || ""));
        if (file) form.append("image", file);

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: form,
            });

            if (res.ok) {
                alert(editId ? 'Vehicle updated!' : 'Vehicle added!');
                setShowForm(false);
                fetchVehicles();
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                const err = await res.json();
                console.error(err);
                alert('Error: ' + (err.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Filtered data
    const filteredData = data
        .filter(v => v.record_status === 1)
        .filter(v => (statusFilter ? v.status === statusFilter : true))
        .filter(v => (searchTerm ? v.vehicles_number?.toLowerCase().includes(searchTerm.toLowerCase()) : true));

    // Pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Vehicles</h2>
                <button className="btn btn-success" onClick={handleAdd}>Add Vehicle</button>
            </div>

            {/* Filters */}
            <div className="row mb-3">
                <div className="col-md-3 mb-2">
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="UnderMaintenance">Under Maintenance</option>
                    </select>
                </div>
                <div className="col-md-3 mb-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search Vehicle Number"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-2 mb-2">
                    <button
                        className="btn btn-secondary w-100"
                        onClick={() => { setStatusFilter(''); setSearchTerm(''); }}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card mb-3 p-3 shadow">
                    <h5>{editId ? "Update" : "Add"} Vehicle</h5>

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">

                            {/* Vehicle Type */}
                            <div className="col-md-3">
                                <label className="form-label">Vehicle Type</label>
                                <input
                                    type="text"
                                    name="vehicle_type"
                                    className="form-control"
                                    value={formData.vehicles_type || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Brand */}
                            <div className="col-md-3">
                                <label className="form-label">Brand</label>
                                <input
                                    type="text"
                                    name="brand"
                                    className="form-control"
                                    value={formData.brand || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Model Name */}
                            <div className="col-md-3">
                                <label className="form-label">Model Name</label>
                                <input
                                    type="text"
                                    name="model_name"
                                    className="form-control"
                                    value={formData.model_name || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Vehicle Number */}
                            <div className="col-md-3">
                                <label className="form-label">Vehicle Number</label>
                                <input
                                    type="text"
                                    name="vehicle_number"
                                    className="form-control"
                                    value={formData.vehicles_number || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Register Date */}
                            <div className="col-md-3">
                                <label className="form-label">Register Date</label>
                                <input
                                    type="date"
                                    name="register_date"
                                    className="form-control"
                                    value={formData.vehicles_register_date || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Condition */}
                            <div className="col-md-3">
                                <label className="form-label">Vehicle Condition</label>
                                <select
                                    name="vehicle_condition"
                                    className="form-select"
                                    value={formData.vehicles_condition || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Good">Good</option>
                                    <option value="Average">Average</option>
                                    <option value="Poor">Poor</option>
                                </select>
                            </div>

                            {/* Number of Seats */}
                            <div className="col-md-3">
                                <label className="form-label">Number of Seats</label>
                                <input
                                    type="number"
                                    name="seat_count"
                                    className="form-control"
                                    value={formData.number_of_seats || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Number of Doors */}
                            <div className="col-md-3">
                                <label className="form-label">Number of Doors</label>
                                <input
                                    type="number"
                                    name="door_count"
                                    className="form-control"
                                    value={formData.number_of_doors || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Total Rows */}
                            <div className="col-md-3">
                                <label className="form-label">Total Rows</label>
                                <input
                                    type="number"
                                    name="total_rows"
                                    className="form-control"
                                    value={formData.total_rows || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Total Columns */}
                            <div className="col-md-3">
                                <label className="form-label">Total Columns</label>
                                <input
                                    type="number"
                                    name="total_columns"
                                    className="form-control"
                                    value={formData.total_columns || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Passenger Capacity */}
                            <div className="col-md-3">
                                <label className="form-label">Passenger Capacity</label>
                                <input
                                    type="number"
                                    name="passenger_capacity"
                                    className="form-control"
                                    value={formData.passenger_capacity || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Vehicle Image */}
                            <div className="col-md-3">
                                <label className="form-label">Vehicle Image</label>
                                <input
                                    type="file"
                                    name="vehicle_image"
                                    className="form-control"
                                    onChange={handleFileChange}
                                />
                                {formData.vehicle_image && (
                                    <div className="mt-2 text-center">
                                        <img
                                            src={formData.vehicle_image}
                                            alt="Preview"
                                            style={{
                                                width: '100px',
                                                height: '70px',
                                                borderRadius: '5px',
                                                objectFit: 'cover',
                                                border: '1px solid #ddd'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div className="col-md-3">
                                <label className="form-label">Status</label>
                                <select
                                    name="status"
                                    className="form-select"
                                    value={formData.status || ""}
                                    onChange={handleChange}
                                >
                                    <option value="">Select</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Under Maintenance">Under Maintenance</option>
                                </select>
                            </div>

                        </div>

                        <div className="mt-3">
                            <button type="submit" className="btn btn-primary me-2">
                                {editId ? "Update" : "Save"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}



            {/* Vehicles Table */}
            <div className="table-responsive mt-3" style={{ overflowX: "auto" }}>
                <table className="table table-bordered align-middle text-center shadow-sm rounded-3" style={{ borderRadius: "12px", overflow: "hidden" }}>
                    <thead className="table-dark" style={{ borderRadius: "12px 12px 0 0 " }}>
                        <tr>
                            <th>ID</th>
                            <th>VEHICLE TYPE</th>
                            <th>BRAND</th>
                            <th>MODEL NAME</th>
                            <th>VEHICLE NUMBER</th>
                            <th>REGISTER DATE</th>
                            <th>CONDITION</th>
                            <th>SEATS</th>
                            <th>DOORS</th>
                            <th>ROWS</th>
                            <th>COLUMNS</th>
                            <th>PASSENGER CAP.</th>
                            <th>IMAGE</th>
                            <th>STATUS</th>
                            <th>ADD USER</th>
                            {isAdmin && (<><th>ACTIONS</th></>)}

                        </tr>
                    </thead>
                    <tbody style={{ backgroundColor: "#fff", marginTop: "10px", }}>
                        {loading ? (
                            <tr><td colSpan="16" className="text-center py-3">Loading...</td></tr>
                        ) : currentData.length === 0 ? (
                            <tr><td colSpan="16" className="text-center py-3 text-muted">No vehicles found</td></tr>
                        ) : (
                            currentData.map((vehicle, index) => (
                                <tr key={vehicle.vehicles_id || index}>
                                    <td>{vehicle.vehicles_id}</td>
                                    <td>{vehicle.vehicles_type}</td>
                                    <td>{vehicle.brand}</td>
                                    <td>{vehicle.model_name}</td>
                                    <td>{vehicle.vehicles_number}</td>
                                    <td>{vehicle.vehicles_register_date?.split("T")[0] || "-"}</td>
                                    <td>{vehicle.vehicles_condition}</td>
                                    <td>{vehicle.number_of_seats}</td>
                                    <td>{vehicle.number_of_doors}</td>
                                    <td>{vehicle.total_rows}</td>
                                    <td>{vehicle.total_columns}</td>
                                    <td>{vehicle.passenger_capacity}</td>
                                    <td>
                                        {vehicle.vehicle_image
                                            ? <img src={vehicle.vehicle_image} alt="vehicle" width="80" height="50" className="rounded border" />
                                            : <span className="text-muted">N/A</span>}
                                    </td>
                                    <td>
                                        {vehicle.status === "Active" ? (
                                            <span className="badge bg-success px-3 py-2 fs-6">Active</span>
                                        ) : vehicle.status === "Inactive" ? (
                                            <span className="badge bg-danger px-3 py-2 fs-6">Stopped</span>
                                        ) : (
                                            <span className="badge bg-warning px-3 py-2 fs-6">Under Maintenance</span>
                                        )}
                                    </td>
                                    <td>{vehicle.adduid}</td>

                                    {isAdmin && (<>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(vehicle)}><PencilSquare /></button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(vehicle.vehicles_id)}><Trash /></button>
                                            </div>
                                        </td>
                                    </>)}

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalItems={totalPages.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}

export default Vehicles;
