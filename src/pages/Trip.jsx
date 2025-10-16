import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import { PencilSquare, Trash, Eye } from "react-bootstrap-icons";
import Select from "react-select"; // ✅ import react-select
import "../App.css";
import Pagination from "../components/Pagination";

function TripForm() {
    const { token, user } = useContext(AuthContext);
    const [showForm, setShowForm] = useState(false);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [formData, setFormData] = useState({
        trip_name: "",
        route_id: "",
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
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [promotions, setPromotions] = useState([]);

    useEffect(() => {
        fetchDropdownData();
        fetchTrips();
    }, []);

    const fetchDropdownData = async () => {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
        try {
            const [routeRes, driverRes, vehicleRes, policyRes, promoRes] =
                await Promise.all([
                    fetch(`${CONFIG.API_BASE_URL}/route`, { headers }),
                    fetch(`${CONFIG.API_BASE_URL}/driver`, { headers }),
                    fetch(`${CONFIG.API_BASE_URL}/vehicles`, { headers }),
                    fetch(`${CONFIG.API_BASE_URL}/cancel`, { headers }),
                    fetch(`${CONFIG.API_BASE_URL}/promotions`, { headers }),
                ]);

            const routdata = await routeRes.json();
            const driversdata = await driverRes.json();
            const vehiclesdata = await vehicleRes.json();
            const policiesdata = await policyRes.json();
            const promotionsdata = await promoRes.json();

            setRoutes(Array.isArray(routdata) ? routdata[0] : []);
            setDrivers(Array.isArray(driversdata) ? driversdata[0] : []);
            setVehicles(Array.isArray(vehiclesdata) ? vehiclesdata[0] : []);
            setPolicies(Array.isArray(policiesdata) ? policiesdata[0] : []);
            setPromotions(Array.isArray(promotionsdata) ? promotionsdata[0] : []);
        } catch (err) {
            console.log(err);
        }
    };

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
            const flatTrips = Trip.flat();
            setTrips(flatTrips);
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
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const getRouteName = (id) => {
        const route = routes.find(r => r.route_id === id);
        return route ? (<span> <strong>{route.route_name}</strong><br /> <small className="text-danger text-opacity-75">{route.route_id}</small> </span>) : id;
    };

    const getDriverName = (id) => {
        const driver = drivers.find(d => d.driver_id === id);
        return driver ? (<span> <strong>{driver.driver_name}</strong><br /> <small className="text-danger text-opacity-75">{driver.driver_phone_number}</small> </span>) : id;
    };

    const getVehicles = (id) => {
        const vehicle = vehicles.find(v => v.vehicles_id === id);
        return vehicle ? (<span> <strong>{vehicle.vehicles_type}</strong><br /> <small className="text-danger text-opacity-75">{vehicle.vehicles_number}</small> </span>) : id;
    };

    const getPolicy = (id) => {
        const policy = policies.find(p => p.policy_id === id);
        return policy ? (<span> <strong>{policy.cancellation_reason}</strong><br /> <small className="text-danger text-opacity-75">{policy.policy_id}</small> </span>) : id;
    };

    const getPromo = (id) => {
        const promo = promotions.find(p => p.promotion_id === id);
        return promo ? (<span> <strong>{promo.promotion_title}</strong><br /> <small className="text-danger text-opacity-75">{promo.promotion_id}</small> </span>) : id;
    };

    const handleSelectChange = (selectedOption, name) => {
        setFormData((prev) => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, adduid: user?.user_id || null };
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
                fetchTrips();
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

        const formatDate = (dateStr) => {
            if (!dateStr) return "";
            const date = new Date(dateStr);
            return date.toISOString().split("T")[0];
        };

        const formatTime = (timeStr) => {
            if (!timeStr) return "";
            const date = new Date(`1970-01-01T${timeStr}`);
            return date.toISOString().substring(11, 16);
        };

        setFormData({
            ...rest,
            trip_date_from: formatDate(rest.trip_date_from),
            trip_date_to: formatDate(rest.trip_date_to),
            trip_time_from: formatTime(rest.trip_time_from),
            trip_time_to: formatTime(rest.trip_time_to),
        });

        setEditId(Trip.trip_id);
        setEditData(Trip);
        setShowForm(true);
    };

    const handleDelete = async (trip_id) => {
        if (!window.confirm("Are you sure you want to delete this trip?")) return;
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/trip/${trip_id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) fetchTrips();
        } catch (err) {
            console.log(err);
        }
    };

    const activeTrips = trips.filter((t) => t.record_status === 1);
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = activeTrips.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(activeTrips.length / itemsPerPage);

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Trips</h2>
                <button className="btn btn-success" onClick={handleAdd}>
                    Add Trip
                </button>
            </div>

            {showForm && (
                <div className="card p-3 shadow">
                    <h5>{editId ? "Update Trip" : "Add Trip"}</h5>
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

                            {/* Route Dropdown (Searchable) */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Route</label>
                                <Select
                                    options={routes.map((r) => ({
                                        value: r.route_id,
                                        label: r.route_name,
                                    }))}
                                    value={
                                        formData.route_id
                                            ? {
                                                value: formData.route_id,
                                                label:
                                                    routes.find((r) => r.route_id === formData.route_id)
                                                        ?.route_name || "",
                                            }
                                            : null
                                    }
                                    onChange={(opt) => handleSelectChange(opt, "route_id")}
                                    isClearable
                                    placeholder="Search or select route..."
                                />
                            </div>

                            {/* Driver Dropdown */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Driver</label>
                                <Select
                                    options={drivers.map((d) => ({
                                        value: d.driver_id,
                                        label: d.driver_name,
                                    }))}
                                    value={
                                        formData.driver_id
                                            ? {
                                                value: formData.driver_id,
                                                label:
                                                    drivers.find(
                                                        (d) => d.driver_id === formData.driver_id
                                                    )?.driver_name || "",
                                            }
                                            : null
                                    }
                                    onChange={(opt) => handleSelectChange(opt, "driver_id")}
                                    isClearable
                                    placeholder="Search or select driver..."
                                />
                            </div>

                            {/* Vehicle Dropdown */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Vehicle</label>
                                <Select
                                    options={vehicles.map((v) => ({
                                        value: v.vehicles_id,
                                        label: `${v.vehicles_type} (${v.vehicles_number})`,
                                    }))}
                                    value={
                                        formData.vehicle_id
                                            ? {
                                                value: formData.vehicle_id,
                                                label:
                                                    vehicles.find(
                                                        (v) => v.vehicles_id === formData.vehicle_id
                                                    )
                                                        ? `${vehicles.find(
                                                            (v) => v.vehicles_id === formData.vehicle_id
                                                        ).vehicles_type} (${vehicles.find(
                                                            (v) => v.vehicles_id === formData.vehicle_id
                                                        ).vehicles_number
                                                        })`
                                                        : "",
                                            }
                                            : null
                                    }
                                    onChange={(opt) => handleSelectChange(opt, "vehicle_id")}
                                    isClearable
                                    placeholder="Search or select vehicle..."
                                />
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
                                <Select
                                    options={policies.map((p) => ({
                                        value: p.policy_id,
                                        label: p.cancellation_reason,
                                    }))}
                                    value={
                                        formData.policy_id
                                            ? {
                                                value: formData.policy_id,
                                                label:
                                                    policies.find(
                                                        (p) => p.policy_id === formData.policy_id
                                                    )?.cancellation_reason || "",
                                            }
                                            : null
                                    }
                                    onChange={(opt) => handleSelectChange(opt, "policy_id")}
                                    isClearable
                                    placeholder="Search or select policy..."
                                />
                            </div>

                            {/* Promotion Dropdown */}
                            <div className="col-md-4 mb-2">
                                <label className="form-label">Promotion</label>
                                <Select
                                    options={promotions.map((p) => ({
                                        value: p.promotion_id,
                                        label: p.promotion_title,
                                    }))}
                                    value={
                                        formData.promotion_id
                                            ? {
                                                value: formData.promotion_id,
                                                label:
                                                    promotions.find(
                                                        (p) => p.promotion_id === formData.promotion_id
                                                    )?.promotion_title || "",
                                            }
                                            : null
                                    }
                                    onChange={(opt) => handleSelectChange(opt, "promotion_id")}
                                    isClearable
                                    placeholder="Search or select promotion..."
                                />
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
                                <select
                                    name="trip_day"
                                    className="form-select"
                                    value={formData.trip_day}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Select Day --</option>
                                    <option value="Monday">Monday</option>
                                    <option value="Tuesday">Tuesday</option>
                                    <option value="Wednesday">Wednesday</option>
                                    <option value="Thursday">Thursday</option>
                                    <option value="Friday">Friday</option>
                                    <option value="Saturday">Saturday</option>
                                    <option value="Sunday">Sunday</option>
                                </select>
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

            {/* Trips Table */}
            <div className="table-responsive mt-4 ">
                <table className="table table-bordered align-middle text-center shadow-sm fs-5">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>TRIP NAME</th>
                            <th>TRIP DATE</th>
                            <th>TRIP TIME</th>
                            <th>TRIP DAY</th>
                            <th>FARE</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((t, i) => (
                            <tr key={i}>
                                <td>{t.trip_id}</td>
                                <td>{t.trip_name}</td>
                                <td>
                                    <td>
                                        {t.trip_date_from === t.trip_date_to
                                            ? t.trip_date_from?.split("T")[0]
                                            : `${t.trip_date_from?.split("T")[0]} - ${t.trip_date_to?.split("T")[0]}`}
                                    </td>

                                </td>
                                <td>
                                    {t.trip_time_from} - {t.trip_time_to}
                                </td>
                                <td>{t.trip_day}</td>
                                <td>₹{t.trip_fare}</td>
                                <td>
                                    <button
                                        className="btn btn-info btn-sm me-2"
                                        onClick={() => setSelectedTrip(t)}
                                    >
                                        <Eye /> View
                                    </button>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => handleEdit(t)}
                                    >
                                        <PencilSquare />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(t.trip_id)}
                                    >
                                        <Trash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Overlay and Sliding Panel */}
            {selectedTrip && (
                <>
                    <div
                        className="details-overlay"
                        onClick={() => setSelectedTrip(null)}
                    ></div>

                    <div className={`details-panel show`}>
                        <div className="card shadow-lg">
                            {/* Header */}
                            <div className="card-header  d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 text-center flex-grow-1 fs-3">
                                    Trip Details
                                </h5>
                                <button
                                    className="btn btn-light btn-sm"
                                    onClick={() => setSelectedTrip(null)}
                                >
                                    ✖
                                </button>
                            </div>

                            {/* Body */}
                            <div className="card-body fs-6">
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6"><strong className="text-success">Trip Name:</strong> {selectedTrip.trip_name}</div>
                                    <div className="col-md-6"><strong className="text-success">Fare:</strong> ₹{selectedTrip.trip_fare}</div>
                                    <div className="col-md-6"><strong className="text-success">Day:</strong> {selectedTrip.trip_day}</div>
                                </div>

                                <hr />

                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <strong className="text-success">Trip Date:</strong> {selectedTrip.trip_date_from === selectedTrip.trip_date_to
                                            ? selectedTrip.trip_date_from?.split("T")[0]
                                            : `${selectedTrip.trip_date_from?.split("T")[0]} - ${selectedTrip.trip_date_to?.split("T")[0]}`}
                                    </div>
                                    <div className="col-md-6"><strong className="text-success">Booked Date:</strong> {selectedTrip.trip_booked_date?.split("T")[0]}</div>
                                    <div className="col-md-6"><strong className="text-success">Time:</strong> {selectedTrip.trip_time_from} - {selectedTrip.trip_time_to}</div>
                                </div>

                                <hr />

                                <div className="row g-3">
                                    <div className="col-md-6"><strong className="text-success">Route:</strong><br /> {getRouteName(selectedTrip.route_id)}</div>
                                    <div className="col-md-6"><strong className="text-success">Driver:</strong><br /> {getDriverName(selectedTrip.driver_id)}</div>
                                    <div className="col-md-6"><strong className="text-success">Vehicle:</strong><br /> {getVehicles(selectedTrip.vehicle_id)}</div>
                                    <div className="col-md-6"><strong className="text-success">Policy:</strong><br /> {getPolicy(selectedTrip.policy_id)}</div>
                                    <div className="col-md-6"><strong className="text-success">Promotion:</strong><br /> {getPromo(selectedTrip.promotion_id)}</div>
                                </div>

                                {/* Close button */}
                                <div className="d-flex justify-content-center mt-4">
                                    <button
                                        className="btn btn-secondary px-4"
                                        onClick={() => setSelectedTrip(null)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </>
            )}


            {/* Pagination */}
            {/* <div className="d-flex justify-content-center mt-3">
                <nav>
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button
                                className="page-link"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            >
                                Previous
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <li
                                key={i}
                                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                        <li
                            className={`page-item ${currentPage === totalPages ? "disabled" : ""
                                }`}
                        >
                            <button
                                className="page-link"
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                }
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>  
            </div> */}
            <Pagination
                currentPage={currentPage}
                totalItems={totalPages.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />

        </div>

    );
}

export default TripForm;
