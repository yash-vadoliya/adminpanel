import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import { PencilSquare, Trash } from 'react-bootstrap-icons';


function TripForm() {
    const { token, user } = useContext(AuthContext);
    const [showForm, setShowForm] = useState(false);
    const [trips, setTrips] = useState([]); // ✅ store all trips here
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [formData, setFormData] = useState({
        trip_name: "",
        route_id: "",
        customer_id: "",
        driver_id: "",
        vehicle_id: "",
        trip_booked_date: "",
        policy_id: "",
        promotion_id: "",
        trip_date_from: "",
        trip_date_to: "",
        trip_time_from: "",
        trip_time_to: "",
        trip_day: "",
        trip_fare: "",
        adduid: user?.user_id || "",
    });

    const [routes, setRoutes] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [promotions, setPromotions] = useState([]);

    // Fetch dropdown data + trips
    useEffect(() => {
        fetchDropdownData();
        fetchTrips();
        // if (editData) {
        //     setFormData(editData);
        //     setShowForm(true);
        // }
    }, []);

    const fetchDropdownData = async () => {
        const method = "GET";
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        };
        try {
            const route = await fetch(`${CONFIG.API_BASE_URL}/route`, { method, headers });
            const customer = await fetch(`${CONFIG.API_BASE_URL}/customer`, { method, headers });
            const drivers = await fetch(`${CONFIG.API_BASE_URL}/driver`, { method, headers });
            const vehicles = await fetch(`${CONFIG.API_BASE_URL}/vehicles`, { method, headers });
            const policies = await fetch(`${CONFIG.API_BASE_URL}/cancel`, { method, headers });
            const promotions = await fetch(`${CONFIG.API_BASE_URL}/promotions`, { method, headers });

            const routdata = await route.json();
            const customerdata = await customer.json();
            const driversdata = await drivers.json();
            const vehiclesdata = await vehicles.json();
            const policiesdata = await policies.json();
            const promotionsdata = await promotions.json();

            // console.log('vehiclesdata', vehiclesdata);
            // console.log('policiesdata', policiesdata);
            // console.log('promotionsdata', promotionsdata);

            setRoutes(Array.isArray(routdata) ? routdata[0] : []);
            setCustomers(Array.isArray(customerdata) ? customerdata[0] : []);
            setDrivers(Array.isArray(driversdata) ? driversdata[0] : []);
            setVehicles(Array.isArray(vehiclesdata) ? vehiclesdata[0] : []);
            setPolicies(Array.isArray(policiesdata) ? policiesdata[0] : []);
            setPromotions(Array.isArray(promotionsdata) ? promotionsdata[0] : []);
        } catch (err) {
            console.log(err);
        }
    }
    const fetchTrips = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${CONFIG.API_BASE_URL}/trip`, {
                method: "GET",
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error(`Error: ${res.status}`);
            const Trip = await res.json();
            //   console.log(Trip);
            setTrips(Array.isArray(Trip[0]) ? Trip[0] : []); // ✅ store trips in trips state
        } catch (err) {
            console.log("Error fetching trips:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setFormData({
            trip_name: "",
            route_id: "",
            customer_id: "",
            driver_id: "",
            vehicle_id: "",
            trip_booked_date: "",
            policy_id: "",
            promotion_id: "",
            trip_date_from: "",
            trip_date_to: "",
            trip_time_from: "",
            trip_time_to: "",
            trip_day: "",
            trip_fare: "",
            adduid: user?.user_id || "",
        });
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const getCustomerName = (id) => {
        const customer = customers.find(c => c.customer_id === id);
        return customer ? `${customer.customer_name} - ${customer.phone_number }` : id;
    };

    const getDriverName = (id) => {
        const driver = drivers.find(d => d.driver_id === id);
        return driver ? `${driver.driver_name} - ${driver.phone_number }` : id;
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                adduid: user?.user_id || null,
            };
            const url = editId
                ? `${CONFIG.API_BASE_URL}/trip/${editId}`
                : `${CONFIG.API_BASE_URL}/trip`;

            const method = editId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert(editData ? "Trip updated!" : "Trip created!");
                fetchTrips(); // ✅ refresh list
                // onSubmitSuccess && onSubmitSuccess();
                setShowForm(false);
            } else {
                const err = await res.json();
                alert("Error: " + (err.error || "Unknown error"));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (Trip) => {
        const { adduid, adddate, deleteuid, deletedate, record_status, created_at, updated_at, ...rest } = Trip;
        setFormData({ ...rest });
        setEditId(Trip.trip_id);
        setShowForm(true);
    }

    const handleDelete = async (trip_id) => {
        if (!window.confirm('Are you sure you want to delete this fare?')) return;
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/trip/${trip_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) fetchTrips();
        } catch (err) {
            console.log(err);
        }
    }

    // Pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = trips.slice(indexOfFirst, indexOfLast); // ✅ paginate trips
    const totalPages = Math.ceil(trips.length / itemsPerPage);

    return (
        <div className="container" style={{ maxWidth: "75rem" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Trips</h2>
                <button className="btn btn-success" onClick={handleAdd}>
                    Add Trip
                </button>
            </div>

            {showForm && (
                <div className="card p-3 shadow">
                    <h5>{editData ? "Edit Trip" : "Add Trip"}</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            {/* Trip Name */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Trip Name</label>
                                <input
                                    type="text"
                                    name="trip_name"
                                    className="form-control"
                                    value={formData.trip_name}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Route Dropdown */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Route</label>
                                <select
                                    name="route_id"
                                    className="form-select"
                                    value={formData.route_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Route --</option>
                                    {Array.isArray(routes) &&
                                        routes.map((r) => (
                                            <option key={r.route_id} value={r.route_id}>
                                                {r.route_name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Customer Dropdown */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Customer</label>
                                <select
                                    name="customer_id"
                                    className="form-select"
                                    value={formData.customer_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Customer --</option>
                                    {Array.isArray(customers) &&
                                        customers.map((c) => (
                                            <option key={c.customer_id} value={c.customer_id}>
                                                {c.customer_name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Driver Dropdown */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Driver</label>
                                <select
                                    name="driver_id"
                                    className="form-select"
                                    value={formData.driver_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Driver --</option>
                                    {Array.isArray(drivers) &&
                                        drivers.map((d) => (
                                            <option key={d.driver_id} value={d.driver_id}>
                                                {d.driver_name}
                                            </option>
                                        ))}
                                </select>
                            </div>


                            {/* Vehicle Dropdown */}

                            <div className="col-md-4 mb-2">
                                <label className="form-label">Vehicle</label>
                                <select
                                    name="vehicle_id"
                                    className="form-control"
                                    value={formData.vehicle_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Vehicle</option>
                                    {vehicles.map((v) => (
                                        <option key={v.vehicles_id} value={v.vehicles_id}>
                                            {v.vehicles_type} ({v.vehicles_number})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Trip Booked Date */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Trip Booked Date</label>
                                <input
                                    type="date"
                                    name="trip_booked_date"
                                    className="form-control"
                                    value={formData.trip_booked_date}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Policy Dropdown */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Policy</label>
                                <select
                                    name="policy_id"
                                    className="form-select"
                                    value={formData.policy_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Policy --</option>
                                    {Array.isArray(policies) &&
                                        policies.map((p) => (
                                            <option key={p.policy_id} value={p.policy_id}>
                                                {p.cancellation_reason}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Promotion Dropdown */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Promotion</label>
                                <select
                                    name="promotion_id"
                                    className="form-select"
                                    value={formData.promotion_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Promotion --</option>
                                    {Array.isArray(promotions) &&
                                        promotions.map((p) => (
                                            <option key={p.promotion_id} value={p.promotion_id}>
                                                {p.promotion_title}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Trip Date From */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Trip Date From</label>
                                <input
                                    type="date"
                                    name="trip_date_from"
                                    className="form-control"
                                    value={formData.trip_date_from}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Trip Date To */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Trip Date To</label>
                                <input
                                    type="date"
                                    name="trip_date_to"
                                    className="form-control"
                                    value={formData.trip_date_to}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Trip Time From */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Trip Time From</label>
                                <input
                                    type="time"
                                    name="trip_time_from"
                                    className="form-control"
                                    value={formData.trip_time_from}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Trip Time To */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Trip Time To</label>
                                <input
                                    type="time"
                                    name="trip_time_to"
                                    className="form-control"
                                    value={formData.trip_time_to}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Trip Day */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Trip Day</label>
                                <input
                                    type="text"
                                    name="trip_day"
                                    className="form-control"
                                    value={formData.trip_day}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Trip Fare */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Trip Fare</label>
                                <input
                                    type="text"
                                    name="trip_fare"
                                    className="form-control"
                                    value={formData.trip_fare}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary me-2">
                            {editData ? "Update" : "Add"}
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

            <div
                style={{
                    maxHeight: "80vh",
                    overflowX: "auto",
                    border: "1px solid #dee2e6",
                }}
            >
                <table className="table table-striped table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>TRIP NAME</th>
                            <th>ROUTE DETAILS</th>
                            <th>CUSTOMER DETAILS</th>
                            <th>DRIVER DETAILS</th>
                            <th>VEHICLE DETAILS</th>
                            <th>TRIP BOOKING DATE</th>
                            <th>POLICY DETAILS</th>
                            <th>PROMOTION DETAILS</th>
                            <th>TRIP DATE FROM</th>
                            <th>TRIP DATE TO</th>
                            <th>TRIP TIME START</th>
                            <th>TRIP TIME END</th>
                            <th>TRIP DAY</th>
                            <th>TRIP FARE</th>
                            <th>ADDUID</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    {/* <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="16" className="text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : currentData.length === 0 ? (
                            <tr>
                                <td colSpan="16" className="text-center">
                                    No trips found
                                </td>
                            </tr>
                        ) : (
                            currentData.map((t, index) => (
                                <tr key={t.trip_id || index}>
                                    <td>{t.trip_id}</td>
                                    <td>{t.trip_name}</td>
                                    <td>{t.route_name || t.route_id}</td>
                                    <td>{t.customer_id} - {t.customer_name} - {t.custmore_phnoe}</td>
                                    <td>{t.driver_id} - {t.driver_name} - {t.driver_phone}</td>
                                    <td>{t.vehicle_name || t.vehicle_id}</td>
                                    <td>{t.trip_booked_date}</td>
                                    <td>{t.policy_name || t.policy_id}</td>
                                    <td>{t.promotion_name || t.promotion_id}</td>
                                    <td>{t.trip_date_from}</td>
                                    <td>{t.trip_date_to}</td>
                                    <td>{t.trip_time_from}</td>
                                    <td>{t.trip_time_to}</td>
                                    <td>{t.trip_day}</td>
                                    <td>{t.trip_fare}</td>
                                    <td>{t.adduid}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(t)}><PencilSquare /></button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.trip_id)}><Trash /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody> */}
                    {currentData
                        .filter(t => t.record_status === 1)   // ✅ only active records
                        .map((t, index) => (
                            <tr key={t.trip_id || index}>
                                <td>{t.trip_id}</td>
                                <td>{t.trip_name}</td>
                                <td>{t.route_name || t.route_id}</td>
                                <td>{getCustomerName(t.customer_id)}</td>
                                <td>{getDriverName(t.driver_id)}</td>
                                <td>{t.vehicle_name || t.vehicle_id}</td>
                                <td>{t.trip_booked_date}</td>
                                <td>{t.policy_name || t.policy_id}</td>
                                <td>{t.promotion_name || t.promotion_id}</td>
                                <td>{t.trip_date_from}</td>
                                <td>{t.trip_date_to}</td>
                                <td>{t.trip_time_from}</td>
                                <td>{t.trip_time_to}</td>
                                <td>{t.trip_day}</td>
                                <td>{t.trip_fare}</td>
                                <td>{t.adduid}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(t)}><PencilSquare /></button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.trip_id)}><Trash /></button>
                                </td>
                            </tr>
                        ))}

                </table>
            </div>

            {/* ✅ Pagination controls */}
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

export default TripForm;
