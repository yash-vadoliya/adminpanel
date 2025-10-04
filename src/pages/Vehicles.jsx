import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../AuthContext';
import CONFIG from '../Config';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

function Vehicles() {
    const { token, user } = useContext(AuthContext);

    // States
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // rows per page
    const [file, setFile] = useState(null);
    const fileInputRef = useRef();

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

    // // Show form for Edit
    // const handleEdit = (vehicle) => {
    //     setFormData({ ...vehicle });
    //     setEditId(vehicle.vehicles_id);
    //     setShowForm(true);
    // };
    // when user clicks Edit
    const handleEdit = (vehicle) => {
        // remove DB-only metadata so formData.adduid won't be a weird value
        const {
            adduid, adddate, deleteuid, deletedate, record_status, created_at, updated_at, ...rest
        } = vehicle;

        setFormData({ ...rest });
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
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
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

    // Pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = data.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return (
        <div className="container" style={{ maxWidth: '75rem' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Vehicles</h2>
                <button className="btn btn-success" onClick={handleAdd}>Add Vehicle</button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="card mb-3 p-3 shadow">
                    <h5>{editId ? 'Edit Vehicle' : 'Add Vehicle'}</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-3 mb-2">
                                <label className="form-label">Vehicle Type</label>
                                <input
                                    type="text"
                                    name="vehicles_type"
                                    className="form-control"
                                    value={formData.vehicles_type}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <label className="form-label">Brand</label>
                                <input
                                    type="text"
                                    name="brand"
                                    className="form-control"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <label className="form-label">Model Name</label>
                                <input
                                    type="text"
                                    name="model_name"
                                    className="form-control"
                                    value={formData.model_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <label className="form-label">Vehicle Number</label>
                                <input
                                    type="text"
                                    name="vehicles_number"
                                    className="form-control"
                                    value={formData.vehicles_number}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <label className="form-label">Register Date</label>
                                <input
                                    type="date"
                                    name="vehicles_register_date"
                                    className="form-control"
                                    // value={formData.vehicles_register_date}
                                    value={formData.vehicles_register_date ? formData.vehicles_register_date.split("T")[0] : ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <label className="form-label">Condition</label>
                                <input
                                    type="text"
                                    name="vehicles_condition"
                                    className="form-control"
                                    value={formData.vehicles_condition}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <label className="form-label">Seats</label>
                                <input
                                    type="number"
                                    name="number_of_seats"
                                    className="form-control"
                                    value={formData.number_of_seats}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <label className="form-label">Doors</label>
                                <input
                                    type="number"
                                    name="number_of_doors"
                                    className="form-control"
                                    value={formData.number_of_doors}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <label className="form-label">Total Rows</label>
                                <input
                                    type="number"
                                    name="total_rows"
                                    className="form-control"
                                    value={formData.total_rows}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <label className="form-label">Total Columns</label>
                                <input
                                    type="number"
                                    name="total_columns"
                                    className="form-control"
                                    value={formData.total_columns}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <label className="form-label">Passenger Capacity</label>
                                <input
                                    type="number"
                                    name="passenger_capacity"
                                    className="form-control"
                                    value={formData.passenger_capacity}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-3 mb-2">
                                <label className="form-label">Image</label>
                                <input
                                    type="file"
                                    name="vehicle_image"
                                    className="form-control"
                                    ref={fileInputRef}
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                                {editId && formData.vehicle_image && (
                                    <div className="mt-2">
                                        <img
                                            src={formData.vehicle_image}
                                            alt="Current"
                                            width="100"
                                            className="border rounded"
                                        />
                                        <p className="text-muted small">Current Image</p>
                                    </div>
                                )}
                            </div>



                            <div className="col-md-3 mb-2">
                                <label className="form-label">Status</label>
                                <select
                                    name="status"
                                    className="form-select"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value={'Active'}>Active</option>
                                    <option value={'Inactive'}>Inactive</option>
                                    <option value={'UnderMaintenance'}>UnderMaintenance</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary me-2">
                            {editId ? "Update" : "Add"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                    </form>

                </div>
            )}

            {/* Scrollable Table */}
            <div style={{ maxHeight: '80vh', overflowX: 'auto', border: '1px solid #dee2e6' }}>
                <table className="table table-striped table-hover ">
                    <thead className="table-light">
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
                            <th>PASSENGER CAP</th>
                            <th>IMAGE</th>
                            <th>STATUS</th>
                            <th>ADD USER</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="16" className="text-center">Loading...</td></tr>
                        ) : currentData.length === 0 ? (
                            <tr><td colSpan="16" className="text-center">No vehicles found</td></tr>
                        ) : currentData
                        .filter(vehicle => vehicle.record_status === 1)
                        .map((vehicle, index) => (
                            <tr key={vehicle.vehicles_id || index}>
                                <td>{vehicle.vehicles_id}</td>
                                <td>{vehicle.vehicles_type}</td>
                                <td>{vehicle.brand}</td>
                                <td>{vehicle.model_name}</td>
                                <td>{vehicle.vehicles_number}</td>
                                <td>{vehicle.vehicles_register_date ? vehicle.vehicles_register_date.split("T")[0] : ""}</td>
                                <td>{vehicle.vehicles_condition}</td>
                                <td>{vehicle.number_of_seats}</td>
                                <td>{vehicle.number_of_doors}</td>
                                <td>{vehicle.total_rows}</td>
                                <td>{vehicle.total_columns}</td>
                                <td>{vehicle.passenger_capacity}</td>
                                <td>{vehicle.vehicle_image ? <img src={vehicle.vehicle_image} alt="vehicle" width="100" /> : 'N/A'}</td>
                                <td>{vehicle.status}</td>
                                <td>{vehicle.adduid}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(vehicle)}><PencilSquare /></button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(vehicle.vehicles_id)}><Trash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-center mt-3">
                <nav>
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default Vehicles;
