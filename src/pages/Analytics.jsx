import React, { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';
import CONFIG from "../Config";

function Analytics() {
    const { token } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('booking');
    const [tableData, setTableData] = useState([]);
    const [filters, setFilters] = useState({
        city_id: '',
        trip_id: '',
        route_id: '',
        customer_id: '',
        driver_id: '',
        vehicle_id: ''
    });

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // const fetchData = async (e) => {
    //     e.preventDefault();
    //     const method = 'GET';
    //     const headers = {
    //         "Content-Type": "application/json",
    //         "Authorization": `Bearer ${token}`,
    //     };

    //     try {
    //         let record = {};

    //         // Fetch Customer
    //         if (filters.customer_id) {
    //             const res = await fetch(`${CONFIG.API_BASE_URL}/customer/${filters.customer_id}`, { method, headers });
    //             const data = await res.json();
    //             record.customer_id = data?.customer_id || filters.customer_id;
    //             record.customer_name = data?.customer_name || "-";
    //             record.customer_email = data?.email || "-";
    //             record.customer_phone = data?.phone_number || "-";
    //         }

    //         // Fetch Trip
    //         if (filters.trip_id) {
    //             const res = await fetch(`${CONFIG.API_BASE_URL}/trip/${filters.trip_id}`, { method, headers });
    //             const data = await res.json();
    //             record.trip_id = data?.trip_id || filters.trip_id;
    //             record.trip_name = data?.trip_name || "-";
    //             record.trip_date_from = data?.trip_date_from || "-";
    //             record.trip_date_to = data?.trip_date_to || "-";
    //             record.trip_fare = data?.trip_fare || "-";
    //         }

    //         // Fetch Driver
    //         if (filters.driver_id) {
    //             const res = await fetch(`${CONFIG.API_BASE_URL}/driver/${filters.driver_id}`, { method, headers });
    //             const data = await res.json();
    //             record.driver_id = data?.driver_id || filters.driver_id;
    //             record.driver_name = data?.driver_name || "-";
    //             record.driver_vehicle_number = data?.driver_vehicle_number || "-";
    //             record.driver_licence_number = data?.driver_licence_number || "-";
    //             record.driver_phone = data?.phone_number || "-";
    //         }

    //         // Fetch Vehicle
    //         if (filters.vehicle_id) {
    //             const res = await fetch(`${CONFIG.API_BASE_URL}/vehicles/${filters.vehicle_id}`, { method, headers });
    //             const data = await res.json();
    //             record.vehicle_id = data?.vehicles_id || filters.vehicle_id;
    //             record.vehicle_type = data?.vehicles_type || "-";
    //             record.brand = data?.brand || "-";
    //             record.model_name = data?.model_name || "-";
    //             record.seats = data?.number_of_seats || "-";
    //         }

    //         // Fetch Route
    //         if (filters.route_id) {
    //             const res = await fetch(`${CONFIG.API_BASE_URL}/route/${filters.route_id}`, { method, headers });
    //             const data = await res.json();
    //             record.route_id = data?.route_id || filters.route_id;
    //             record.route_name = data?.route_name || "-";
    //             record.route_start = data?.route_start_from || "-";
    //             record.route_end = data?.route_end_to || "-";
    //             record.distance = data?.distance_km || "-";
    //         }

    //         // Fetch City
    //         if (filters.city_id) {
    //             const res = await fetch(`${CONFIG.API_BASE_URL}/city/${filters.city_id}`, { method, headers });
    //             const data = await res.json();
    //             record.city_id = data?.id || filters.city_id;
    //             record.city_name = data?.city || "-";
    //             record.state = data?.state || "-";
    //         }

    //         setTableData([record]);

    //     } catch (err) {
    //         console.log("Error fetching data:", err);
    //     }
    // };

    const fetchData = async (e) => {
        e.preventDefault();
        const method = 'GET';
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        };

        try {
            let record = {};

            // Customer
            if (filters.customer_id) {
                const res = await fetch(`${CONFIG.API_BASE_URL}/customer/${filters.customer_id}`, { method, headers });
                const data = await res.json();
                //   console.log("Customer API Response:", data);

                // Handle array-in-array safely
                const customer = Array.isArray(data) && Array.isArray(data[0]) ? data[0][0] : data[0] || data;

                // Now assign values
                record.customer_id = customer?.customer_id || filters.customer_id;
                record.customer_name = customer?.customer_name || "-";
                record.customer_email = customer?.email || "-";
                record.customer_phone = customer?.phone_number || "-";

                //   console.log("Parsed Customer:", customer);
            }


            // Trip
            if (filters.trip_id) {
                const res = await fetch(`${CONFIG.API_BASE_URL}/trip/${filters.trip_id}`, { method, headers });
                const data = await res.json();
                console.log("Trip API Response:", data);
                const Trip = Array.isArray(data) && Array.isArray(data[0]) ? data[0][0] : data[0] || data;
                record.trip_id = Trip?.trip_id || filters.trip_id;
                record.trip_name = Trip?.trip_name || "-";
                record.trip_date_from = Trip?.trip_date_from || "-";
                record.trip_date_to = Trip?.trip_date_to || "-";
                record.trip_fare = Trip?.trip_fare || "-";
            }

            // Driver
            if (filters.driver_id) {
                const res = await fetch(`${CONFIG.API_BASE_URL}/driver/${filters.driver_id}`, { method, headers });
                const data = await res.json();
                console.log("Driver API Response:", data);
                const Driver = Array.isArray(data) && Array.isArray(data[0]) ? data[0][0] : data[0] || data;

                record.driver_id = Driver?.driver_id || filters.driver_id;
                record.driver_name = Driver?.driver_name || "-";
                record.driver_vehicle_number = Driver?.driver_vehicle_number || "-"; // spelling matches DB
                record.driver_licence_number = Driver?.driver_licence_number || "-";
                record.driver_phone = Driver?.phone_number || "-";
            }

            // Vehicle
            if (filters.vehicle_id) {
                const res = await fetch(`${CONFIG.API_BASE_URL}/vehicles/${filters.vehicle_id}`, { method, headers });
                const data = await res.json();
                console.log("Vehicle API Response:", data);
                const Vehicle = Array.isArray(data) && Array.isArray(data[0]) ? data[0][0] : data[0] || data;

                record.vehicle_id = Vehicle?.vehicles_id || filters.vehicle_id;
                record.vehicle_type = Vehicle?.vehicles_type || "-";
                record.brand = Vehicle?.brand || "-";
                record.model_name = Vehicle?.model_name || "-";
                record.seats = Vehicle?.number_of_seats || "-";
            }

            // Route
            if (filters.route_id) {
                // console.log(filters.route_id);
                const res = await fetch(`${CONFIG.API_BASE_URL}/route/${filters.route_id}`, { method, headers });
                const data = await res.json();
                console.log("Route API Response:", data);
                const Route = Array.isArray(data) && Array.isArray(data[0]) ? data[0][0] : data[0] || data;

                record.route_id = Route?.route_id || filters.route_id;
                record.route_name = Route?.route_name || "-";
                record.route_start = Route?.route_start_from || "-";
                record.route_end = Route?.route_end_to || "-";
                record.distance_km = Route?.distance_KM || "-";
            }

            // City
            if (filters.city_id) {
                const res = await fetch(`${CONFIG.API_BASE_URL}/city/${filters.city_id}`, { method, headers });
                const data = await res.json();
                console.log("City API Response:", data);
                const City = Array.isArray(data) && Array.isArray(data[0]) ? data[0][0] : data[0] || data;

                record.city_id = City?.id || filters.city_id;
                record.city_name = City?.city || "-";
                record.state = City?.state || "-";
            }

            // User
            if (filters.user_id) {
                console.log(filters.user_id);
                const res = await fetch(`${CONFIG.API_BASE_URL}/user/${filters.user_id}`, { method, headers });
                const data = await res.json();
                console.log(data);
                const User = Array.isArray(data) && Array.isArray(data[0]) ? data[0][0] : data[0] || data;
                record.user_id = User?.user_id || filters.user_id;
                record.user_name = User?.user_name || "-";
            }

            // Cancellation 
            if (filters.user_id) {
                const res = await fetch(`${CONFIG.API_BASE_URL}/cancel/?user_id=${filters.user_id}`, { method, headers });
                const data = await res.json();
                const Cancel = Array.isArray(data) && Array.isArray(data[0]) ? data[0][0] : data[0] || data;
                record.policy_id = Cancel?.policy_id || "-";
                record.cancellation_reason = Cancel?.cancellation_reason || "-";
                record.refund_amount = Cancel?.refund_amount || "-";
                record.status = Cancel?.status || "-";
                record.cancellation_date = Cancel?.cancellation_date || "-";
            }

            console.log("Final Record:", record); // 👈 print merged record
            setTableData([record]);

        } catch (err) {
            console.log("Error fetching data:", err);
        }
    };

    const exportCSV = () => {
        if (!tableData || tableData.length === 0) {
            alert("No records available to export!");
            return;
        }

        let header = [];
        const csvRows = [];

        if (activeTab === 'booking') {
            header = [
                "Customer ID", "Customer Name", "Customer Email", "Customer Phone",
                "Trip ID", "Trip Name", "Trip Date From", "Trip Date To", "Trip Fare",
                "Driver ID", "Driver Name", "Driver Vehicle No", "Driver Licence No", "Driver Phone",
                "Vehicle ID", "Vehicle Type", "Brand", "Model", "Seats",
                "Route ID", "Route Name", "Route Start", "Route End", "Distance (KM)",
                "City ID", "City", "State"
            ];

            csvRows.push(header.join(","));
            tableData.forEach((row) => {
                const values = [
                    row.customer_id, row.customer_name, row.customer_email, row.customer_phone,
                    row.trip_id, row.trip_name, row.trip_date_from, row.trip_date_to, row.trip_fare,
                    row.driver_id, row.driver_name, row.driver_vehicle_number, row.driver_licence_number, row.driver_phone,
                    row.vehicle_id, row.vehicle_type, row.brand, row.model_name, row.seats,
                    row.route_id, row.route_name, row.route_start, row.route_end, row.distance_km,
                    row.city_id, row.city_name, row.state
                ];
                const escaped = values.map((val) => `"${val ?? "-"}"`);
                csvRows.push(escaped.join(","));
            });
        } else if (activeTab === 'booking_refund') {
            header = [
                "User ID", "User Name",
                "Policy ID", "Cancellation Reason", "Status", "Refund Amount", "Cancellation Date",
            ];

            csvRows.push(header.join(","));
            tableData.forEach((row) => {
                const values = [
                    row.user_id, row.user_name, row.policy_id, row.cancellation_reason,
                    row.status, row.refund_amount, row.cancellation_date
                ];
                const escaped = values.map((val) => `"${val ?? "-"}"`);
                csvRows.push(escaped.join(","));
            });
        }

        // ✅ Create downloadable CSV content
        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `analytics_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    };

return (
    <div className='container' style={{ maxWidth: '90rem' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Analytics</h2>
        </div>

        <div className="card text-center">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs text-dark">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'booking' ? 'active' : ''}`}
                            onClick={() => setActiveTab('booking')}>
                            Booking
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'booking_refund' ? 'active' : ''}`}
                            onClick={() => setActiveTab('booking_refund')}>
                            Booking Refund logs
                        </button>
                    </li>
                </ul>
            </div>

            <div className="card-body">
                {activeTab === 'booking' && (
                    <>
                        {/* Filter Form */}
                        <form onSubmit={fetchData}>
                            <div className="row">
                                {['city_id', 'trip_id', 'route_id', 'customer_id', 'driver_id', 'vehicle_id'].map((field, i) => (
                                    <div key={i} className="col-md-2 mb-2">
                                        <input
                                            type="text"
                                            name={field}
                                            value={filters[field]}
                                            className='form-control'
                                            placeholder={`Enter ${field.replace('_', ' ').toUpperCase()}`}
                                            onChange={handleChange}
                                        />
                                    </div>
                                ))}
                                <div className="col-md-12 mt-2">
                                    <button className='btn btn-info' type="submit">Load Record</button>
                                    <button className='btn btn-success' type="button" onClick={exportCSV}>Export CSV</button>
                                </div>
                            </div>
                        </form>

                        {/* Table */}
                        <div className="table-responsive mt-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <table className="table table-bordered table-hover">
                                <thead className="table-dark">
                                    {/* <tr>
                                            <th colSpan="4">Customer</th>
                                            <th colSpan="4">Trip</th>
                                            <th colSpan="4">Driver</th>
                                            <th colSpan="4">Vehicle</th>
                                            <th colSpan="4">Route</th>
                                            <th colSpan="3">City</th>
                                        </tr> */}
                                    <tr>
                                        <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
                                        <th>ID</th><th>Name</th><th>Date From</th><th>Date To</th><th>Fare</th>
                                        <th>ID</th><th>Name</th><th>Veh No</th><th>Licence</th><th>Phone</th>
                                        <th>ID</th><th>Type</th><th>Brand</th><th>Model</th><th>Seats</th>
                                        <th>ID</th><th>Name</th><th>Start</th><th>End</th><th>Distance</th>
                                        <th>ID</th><th>City</th><th>State</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.length === 0 ? (
                                        <tr>
                                            <td colSpan="23" className='text-center'>No data found</td>
                                        </tr>
                                    ) : (
                                        tableData.map((row, idx) => (
                                            <tr key={idx}>
                                                {/* Customer */}
                                                <td>{row.customer_id}</td>
                                                <td>{row.customer_name}</td>
                                                <td>{row.customer_email}</td>
                                                <td>{row.customer_phone}</td>
                                                {/* Trip */}
                                                <td>{row.trip_id}</td>
                                                <td>{row.trip_name}</td>
                                                <td>{row.trip_date_from}</td>
                                                <td>{row.trip_date_to}</td>
                                                <td>{row.trip_fare}</td>
                                                {/* Driver */}
                                                <td>{row.driver_id}</td>
                                                <td>{row.driver_name}</td>
                                                <td>{row.driver_vehicle_number}</td>
                                                <td>{row.driver_licence_number}</td>
                                                <td>{row.driver_phone}</td>
                                                {/* Vehicle */}
                                                <td>{row.vehicle_id}</td>
                                                <td>{row.vehicle_type}</td>
                                                <td>{row.brand}</td>
                                                <td>{row.model_name}</td>
                                                <td>{row.seats}</td>
                                                {/* Route */}
                                                <td>{row.route_id}</td>
                                                <td>{row.route_name}</td>
                                                <td>{row.route_start}</td>
                                                <td>{row.route_end}</td>
                                                <td>{row.distance_km}</td>
                                                {/* City */}
                                                <td>{row.city_id}</td>
                                                <td>{row.city_name}</td>
                                                <td>{row.state}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {activeTab === 'booking_refund' && (
                    <section id='booking_refund'>
                        <form onSubmit={fetchData}>
                            <div className="row">
                                {['user_id'].map((field, i) => (
                                    <div key={i} className="col-md-2 mb-2">
                                        <input
                                            type="text"
                                            name={field}
                                            value={filters[field]}
                                            className='form-control'
                                            placeholder={`Enter ${field.replace('_', ' ').toUpperCase()}`}
                                            onChange={handleChange}
                                        />
                                    </div>
                                ))}
                                <div className="col-md-12 mt-2">
                                    <button className='btn btn-info' type="submit">Load Record</button>
                                    <button className='btn btn-success' type="button" onClick={exportCSV}>Export CSV</button>
                                </div>
                            </div>
                        </form>

                        <div className="table-responsive mt-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <table className="table table-bordered table-hover">
                                <thead className="table-dark">
                                    <tr>
                                        <th>User ID</th><th>User Name</th>
                                        <th>Policy ID</th><th>Cancellation Reason</th><th>status</th><th>Refund Amount</th><th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.length === 0 ? (
                                        <tr>
                                            <td colSpan="23" className='text-center'>No data found</td>
                                        </tr>
                                    ) : (
                                        tableData.map((row, idx) => (
                                            <tr key={idx}>
                                                {/* Customer */}
                                                <td>{row.user_id}</td>
                                                <td>{row.user_name}</td>
                                                {/* Trip */}
                                                <td>{row.policy_id}</td>
                                                <td>{row.cancellation_reason}</td>
                                                <td>{row.status}</td>
                                                <td>{row.refund_amount}</td>
                                                <td>{row.cancellation_date}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    </div>
);
}

export default Analytics;
