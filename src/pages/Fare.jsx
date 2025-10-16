import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import CONFIG from '../Config';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import Pagination from '../components/Pagination';

function Fare() {
    const { token, user } = useContext(AuthContext);
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState([]);
    const [editId, setEditId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [filteredFares, setFilteredFares] = useState([]);
    const [formData, setFormData] = useState({
        fare_type: '',
        fare_per_stop: '',
        base_fare: '',
        fare_per_KM: '',
        status: 'Active',
        adduid: ''
    });
    const [filters, setFilters] = useState({
        fare_type: "",
        status: ""
    });

    useEffect(() => {
        fetchFare();
    }, []);

    useEffect(() => {
        // Apply filters whenever data or filters change
        let filtered = data
            .filter(fare => fare.record_status === 1)
            .filter(fare =>
                (filters.fare_type ? fare.fare_type === filters.fare_type : true) &&
                (filters.status ? fare.status === filters.status : true)
            );
        setFilteredFares(filtered);
        setCurrentPage(1); // Reset pagination when filters change
    }, [data, filters]);

    const fetchFare = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/fare`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const Fare = await res.json();
            console.log(Fare[0]);
            setData(Fare[0] || []);
            // console.log('Set Data:',setData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleAdd = () => {
        setFormData({
            fare_type: '',
            fare_per_stop: '',
            base_fare: '',
            fare_per_KM: '',
            status: 'Active',
            adduid: ''
        });
        setEditId(null);
        setShowForm(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editId ? 'PUT' : 'POST';
        const url = editId
            ? `${CONFIG.API_BASE_URL}/fare/${editId}`
            : `${CONFIG.API_BASE_URL}/fare`;

        try {
            const payload = {
                ...formData,
                adduid: user?.user_id || null,
            };
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert(editId ? 'Fare updated!' : 'Fare added!');
                setShowForm(false);
                fetchFare();
            } else {
                const err = await res.json();
                console.error(err);
                alert('Error: ' + (err.error));
            }
        } catch (err) {
            console.log(err);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleEdit = (fare) => {
        const { adduid, adddate, deleteuid, deletedate, record_status, created_at, updated_at, ...rest } = fare;
        setFormData({ ...rest });
        setEditId(fare.fare_id);
        setShowForm(true);
    }

    const handleDelete = async (fare_id) => {
        if (!window.confirm('Are you sure you want to delete this fare?')) return;
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/fare/${fare_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) fetchFare();
        } catch (err) {
            console.log(err);
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    }

    // Pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = filteredFares.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredFares.length / itemsPerPage);

    return (
        <>
            <div className="container-fluid" >
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Fare</h2>
                    <button className="btn btn-success" onClick={handleAdd}>Add Fare</button>
                </div>
                <div className="d-flex gap-3 mb-3">
                    {/* Filter by fare_type */}
                    <select
                        name="fare_type"
                        className="form-select w-auto"
                        value={filters.fare_type}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Types</option>
                        <option value="fare_per_stop">Fare Per Stop</option>
                        <option value="fare_per_KM">Fare Per KM</option>
                    </select>

                    {/* Filter by status */}
                    <select
                        name="status"
                        className="form-select w-auto"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Stopped</option>
                    </select>
                </div>
                {/* Form */}
                {showForm && (
                    <div className="card mb-3 p-3 shadow">
                        <h5>{editId ? 'Edit Fare' : 'Add Fare'}</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-3 mb-2">
                                    <label className="form-label">Fare Type</label>
                                    <select
                                        name="fare_type"
                                        className="form-select"
                                        value={formData.fare_type}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- Select Fare Type --</option>
                                        <option value="fare_per_stop">Fare Per Stop</option>
                                        <option value="fare_per_KM">Fare Per KM</option>
                                    </select>
                                </div>

                                {(formData.fare_type === "fare_per_stop" || formData.fare_type === "fare_per_KM") && (
                                    <div className="col-md-3 mb-2">
                                        <label className="form-label">
                                            {formData.fare_type === "fare_per_stop" ? "Fare Per Stop" : "Fare Per KM"}
                                        </label>
                                        <input
                                            type="text"
                                            name={formData.fare_type}
                                            className="form-control"
                                            value={formData[formData.fare_type] || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )}

                                {formData.fare_type && (
                                    <>
                                        <div className="col-md-3 mb-2">
                                            <label className="form-label">Base Fare</label>
                                            <input
                                                type="text"
                                                name="base_fare"
                                                className="form-control"
                                                value={formData.base_fare}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="col-md-3 mb-2">
                                            <label className="form-label">Status</label>
                                            <select
                                                name="status"
                                                className="form-select"
                                                value={formData.status}
                                                onChange={handleChange}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Stopped</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button type="submit" className="btn btn-primary me-2">
                                {editId ? "Update" : "Add"}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </form>
                    </div>
                )}

                {/* Table */}
                <div style={{ maxHeight: '80vh', overflowX: 'auto',}}>
                    <div className="table-responsive">
                    <table className="table table-bordered align-middle text-center shadow-sm rounded-3" style={{ borderRadius: "12px", overflow: "hidden" }}>
                        <thead className="table-dark" style={{ borderRadius: "12px 12px 0 0 " }}>
                            <tr>
                                <th>ID</th>
                                <th>FARE TYPE</th>
                                <th>FARE PER STOP</th>
                                <th>BASE FARE</th>
                                <th>FARE PER KM</th>
                                <th>STATUS</th>
                                <th>ADDUID</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody style={{ backgroundColor: "#fff", marginTop: "10px", display: "table-row-group"}}>
                            {loading ? (
                                <tr>
                                    <td colSpan="16" className='text-center'>Loading..</td>
                                </tr>
                            ) : currentData.length === 0 ? (
                                <tr>
                                    <td colSpan="16" className='text-center'> No Fare Found</td>
                                </tr>
                            ) : currentData.map((fare, index) => (
                                <tr key={fare.fare_id || index}>
                                    <td>{fare.fare_id}</td>
                                    <td>{fare.fare_type}</td>
                                    <td>{fare.fare_per_stop}</td>
                                    <td>{fare.base_fare}</td>
                                    <td>{fare.fare_per_KM}</td>
                                    <td>{fare.status === 'Active' ? (
                                        <span className="badge bg-success px-3 py-2 fs-6">Active</span>
                                    ) : (
                                        <span className="badge bg-danger px-3 py-2 fs-6">Stopped</span>
                                    )}</td>
                                    <td>{fare.adduid}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(fare)}><PencilSquare /></button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(fare.fare_id)}><Trash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>

                {/* Pagination */}
               <Pagination
                             currentPage={currentPage}
                             totalItems={totalPages.length}
                             itemsPerPage={itemsPerPage}
                             onPageChange={setCurrentPage}
                           />
            </div>
        </>
    )
}

export default Fare;
