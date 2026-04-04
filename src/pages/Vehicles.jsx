// import React, { useContext, useEffect, useRef, useState } from 'react';
// import { AuthContext } from '../AuthContext';
// import CONFIG from '../Config';
// import { PencilSquare, Trash } from 'react-bootstrap-icons';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import Pagination from '../components/Pagination';
// import ROLES from '../Role';

// import useVehicles from "../Hooks/useVehicles";

// function Vehicles() {
//     const { token, user } = useContext(AuthContext);

//     // States
//     const [data, setData] = useState([]);
//     // const [loading, setLoading] = useState(true);
//     const [showForm, setShowForm] = useState(false); 
//     const [editId, setEditId] = useState(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage] = useState(10); // rows per page
//     const [file, setFile] = useState(null);
//     const fileInputRef = useRef();

//     const travel_id = user.travel_id;
//     console.log("Travel_id:", travel_id);
//     console.log("User:", user);

//     // Filters
//     const [statusFilter, setStatusFilter] = useState('');
//     const [searchTerm, setSearchTerm] = useState('');

//     const [formData, setFormData] = useState({
//         vehicles_name: '',
//         vehicles_type: '',
//         brand: '',
//         model_name: '',
//         vehicles_number: '',
//         vehicles_register_date: '',
//         vehicles_condition: '',
//         number_of_seats: '',
//         number_of_doors: '',
//         total_rows: '',
//         total_columns: '',
//         passenger_capacity: '',
//         vehicle_image: '',
//         status: 'Active',
//     });

//     // Role Base
//     const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role_id);

//     const { vehicles, loading, fetchVehicles } = useVehicles();


//     // Fetch vehicles
//     useEffect(() => {
//         fetchVehicles();
//     }, []);



//     // Handle form changes
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));

//     };

//     // Show form for Add
//     const handleAdd = () => {
//         setFormData({
//             vehicles_name: '',
//             vehicles_type: '',
//             brand: '',
//             model_name: '',
//             vehicles_number: '',
//             vehicles_register_date: '',
//             vehicles_condition: '',
//             number_of_seats: '',
//             number_of_doors: '',
//             total_rows: '',
//             total_columns: '',
//             passenger_capacity: '',
//             vehicle_image: '',
//             status: '',
//         });
//         setEditId(null);
//         setShowForm(true);
//     };

//     // Show form for Edit
//     const handleEdit = (vehicle) => {
//         const { adduid, adddate, deleteuid, deletedate, record_status, created_at, updated_at, ...rest } = vehicle;
//         const formattedDate = vehicle.vehicles_register_date
//             ? new Date(vehicle.vehicles_register_date).toISOString().split('T')[0]
//             : '';

//         setFormData({
//             ...rest,
//             vehicles_register_date: formattedDate, // ✅ correctly formatted for date input
//         });
//         setFile(null);
//         setEditId(vehicle.vehicles_id);
//         setShowForm(true);
//     };

//     // Delete vehicle
//     const handleDelete = async (vehicles_id) => {
//         if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
//         try {
//             const res = await fetch(`${CONFIG.API_BASE_URL}/vehicles/${vehicles_id}`, {
//                 method: 'DELETE',
//                 headers: { 'Authorization': `Bearer ${token}` },
//             });
//             if (res.ok) fetchVehicles();
//             window.location.reload();
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const getFileName = (path) => {
//         return path.split("\\").pop();
//     };


//     const handleFileChange = (e) => {
//         const selectedFile = e.target.files[0];
//         setFile(selectedFile);

//         if (selectedFile) {
//             // show preview for newly selected image
//             const previewURL = URL.createObjectURL(selectedFile);
//             setFormData(prev => ({ ...prev, vehicle_image: previewURL }));
//         }
//     };


//     // Submit form
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         console.log("editId :", editId);

//         const method = editId ? 'PUT' : 'POST';
//         const url = editId
//             ? `${CONFIG.API_BASE_URL}/vehicles/${editId}`
//             : `${CONFIG.API_BASE_URL}/vehicles`;

//         const form = new FormData();
//         Object.keys(formData).forEach(key => {
//             form.append(key, formData[key]);
//         });
//         form.append("adduid", String(user?.user_id || ""));
//         if (file) form.append("image", file);

//         try {
//             const res = await fetch(url, {
//                 method,
//                 headers: { 'Authorization': `Bearer ${token}` },
//                 body: form,
//             });

//             if (res.ok) {
//                 alert(editId ? 'Vehicle updated!' : 'Vehicle added!');
//                 setShowForm(false);
//                 fetchVehicles();
//                 if (fileInputRef.current) fileInputRef.current.value = "";
//             } else {
//                 const err = await res.json();
//                 console.error(err);
//                 alert('Error: ' + (err.error || 'Unknown error'));
//             }
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     // Filtered data
//     const filteredData = vehicles
//         .filter(v => v.record_status === 1)
//         .filter(v => (statusFilter ? v.status === statusFilter : true))
//         .filter(v => (searchTerm ? v.vehicles_number?.toLowerCase().includes(searchTerm.toLowerCase()) : true));
//     // Pagination
//     const indexOfLast = currentPage * itemsPerPage;
//     const indexOfFirst = indexOfLast - itemsPerPage;
//     const currentData = filteredData.slice(indexOfFirst, indexOfLast);
//     const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//     return (
//         <div className="container-fluid">
//             <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h2>Vehicles</h2>
//                 <button className="btn btn-success" onClick={handleAdd}>Add Vehicle</button>
//             </div>

//             {/* Filters */}
//             <div className="row mb-3">
//                 <div className="col-md-3 mb-2">
//                     <select
//                         className="form-select"
//                         value={statusFilter}
//                         onChange={(e) => setStatusFilter(e.target.value)}
//                     >
//                         <option value="">All Status</option>
//                         <option value="Active">Active</option>
//                         <option value="Inactive">Inactive</option>
//                         <option value="UnderMaintenance">Under Maintenance</option>
//                     </select>
//                 </div>
//                 <div className="col-md-3 mb-2">
//                     <input
//                         type="text"
//                         className="form-control"
//                         placeholder="Search Vehicle Number"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                 </div>
//                 <div className="col-md-2 mb-2">
//                     <button
//                         className="btn btn-secondary w-100"
//                         onClick={() => { setStatusFilter(''); setSearchTerm(''); }}
//                     >
//                         Clear Filters
//                     </button>
//                 </div>
//             </div>

//             {showForm && (
//                 <div className="card mb-3 p-3 shadow">
//                     <h5>{editId ? "Update" : "Add"} Vehicle</h5>

//                     <form onSubmit={handleSubmit}>
//                         <div className="row g-3">

//                             {/* Vehicle Name */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Vehicle Name</label>
//                                 <input
//                                     type="text"
//                                     name="vehicles_name"
//                                     className="form-control"
//                                     value={formData.vehicles_name || ""}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>

//                             {/* Vehicle Type */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Vehicle Type</label>
//                                 {/* <input
//                                     type="text"
//                                     name="vehicles_type"
//                                     className="form-control"
//                                     value={formData.vehicles_type || ""}
//                                     onChange={handleChange}
//                                     required
//                                 /> */}
//                                 <select
//                                     name="vehicles_type"
//                                     className="form-select"
//                                     value={formData.vehicles_type || ""}
//                                     onChange={handleChange}
//                                     required
//                                 >
//                                     <option value="">Select</option>
//                                     <option value="Sleeper">Sleeper</option>
//                                     <option value="AC Sleeper">AC Sleeper</option>
//                                     <option value="Seater">Seater</option>
//                                     <option value="AC Seater">AC Seater</option>
//                                     <option value="Volvo Sleeper">Volvo Sleeper</option>
//                                     <option value="Volvo Seater">Volvo Seater</option>
//                                     <option value="Mini Bus Seater">Mini Bus Seater</option>
//                                     <option value="Electric Seater">Electric Seater</option>
//                                 </select>
//                             </div>

//                             {/* Brand */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Brand</label>
//                                 <input
//                                     type="text"
//                                     name="brand"
//                                     className="form-control"
//                                     value={formData.brand || ""}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>

//                             {/* Model Name */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Model Name</label>
//                                 <input
//                                     type="text"
//                                     name="model_name"
//                                     className="form-control"
//                                     value={formData.model_name || ""}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>

//                             {/* Vehicle Number */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Vehicle Number</label>
//                                 <input
//                                     type="text"
//                                     name="vehicles_number"
//                                     className="form-control"
//                                     value={formData.vehicles_number || ""}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>

//                             {/* Register Date */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Register Date</label>
//                                 <input
//                                     type="date"
//                                     name="vehicles_register_date"
//                                     className="form-control"
//                                     value={formData.vehicles_register_date || ""}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>

//                             {/* Condition */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Vehicle Condition</label>
//                                 <select
//                                     name="vehicles_condition"
//                                     className="form-select"
//                                     value={formData.vehicles_condition || ""}
//                                     onChange={handleChange}
//                                     required
//                                 >
//                                     <option value="">Select</option>
//                                     <option value="Good">Good</option>
//                                     <option value="Average">Average</option>
//                                     <option value="Poor">Poor</option>
//                                 </select>
//                             </div>

//                             {/* Number of Seats */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Number of Seats</label>
//                                 <input
//                                     type="number"
//                                     name="number_of_seats"
//                                     className="form-control"
//                                     value={formData.number_of_seats || ""}
//                                     onChange={handleChange}
//                                 />
//                             </div>

//                             {/* Number of Doors */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Number of Doors</label>
//                                 <input
//                                     type="number"
//                                     name="number_of_doors"
//                                     className="form-control"
//                                     value={formData.number_of_doors || ""}
//                                     onChange={handleChange}
//                                 />
//                             </div>

//                             {/* Total Rows */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Total Rows</label>
//                                 <input
//                                     type="number"
//                                     name="total_rows"
//                                     className="form-control"
//                                     value={formData.total_rows || ""}
//                                     onChange={handleChange}
//                                 />
//                             </div>

//                             {/* Total Columns */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Total Columns</label>
//                                 <input
//                                     type="number"
//                                     name="total_columns"
//                                     className="form-control"
//                                     value={formData.total_columns || ""}
//                                     onChange={handleChange}
//                                 />
//                             </div>

//                             {/* Passenger Capacity */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Passenger Capacity</label>
//                                 <input
//                                     type="number"
//                                     name="passenger_capacity"
//                                     className="form-control"
//                                     value={formData.passenger_capacity || ""}
//                                     onChange={handleChange}
//                                 />
//                             </div>

//                             {/* Vehicle Image */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Vehicle Image</label>
//                                 <input
//                                     type="file"
//                                     name="vehicle_image"
//                                     className="form-control"
//                                     onChange={handleFileChange}
//                                 />
//                                 <div className="muted">Jpg Images is Allow</div>
//                                 {formData.vehicle_image && (
//                                     <div className="mt-2 text-center">
//                                         <img
//                                             src={formData.vehicle_image}
//                                             alt="Preview"
//                                             style={{
//                                                 width: '100px',
//                                                 height: '70px',
//                                                 borderRadius: '5px',
//                                                 objectFit: 'cover',
//                                                 border: '1px solid #ddd'
//                                             }}
//                                         />
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Status */}
//                             <div className="col-md-3">
//                                 <label className="form-label">Status</label>
//                                 <select
//                                     name="status"
//                                     className="form-select"
//                                     value={formData.status || ""}
//                                     onChange={handleChange}
//                                 >
//                                     <option value="">Select</option>
//                                     <option value="Active">Active</option>
//                                     <option value="Inactive">Inactive</option>
//                                     <option value="Under Maintenance">Under Maintenance</option>
//                                 </select>
//                             </div>

//                         </div>

//                         <div className="mt-3">
//                             <button type="submit" className="btn btn-primary me-2">
//                                 {editId ? "Update" : "Save"}
//                             </button>
//                             <button
//                                 type="button"
//                                 className="btn btn-secondary"
//                                 onClick={() => setShowForm(false)}
//                             >
//                                 Cancel
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             )}



//             {/* Vehicles Table */}
//             <div className="table-responsive mt-3" style={{ overflowX: "auto" }}>
//                 <table className="table table-bordered align-middle text-center shadow-sm rounded-3" style={{ borderRadius: "12px", overflow: "hidden" }}>
//                     <thead className="table-dark" style={{ borderRadius: "12px 12px 0 0 " }}>
//                         <tr>
//                             <th>ID</th>
//                             <th>VEHICLE NAME</th>
//                             <th>VEHICLE TYPE</th>
//                             <th>BRAND</th>
//                             <th>MODEL NAME</th>
//                             <th>VEHICLE NUMBER</th>
//                             <th>REGISTER DATE</th>
//                             <th>CONDITION</th>
//                             <th>SEATS</th>
//                             <th>DOORS</th>
//                             <th>ROWS</th>
//                             <th>COLUMNS</th>
//                             <th>PASSENGER CAP.</th>
//                             <th>IMAGE</th>
//                             <th>STATUS</th>
//                             <th>ADD USER</th>
//                             {isAdmin && (<><th>ACTIONS</th></>)}

//                         </tr>
//                     </thead>
//                     <tbody style={{ backgroundColor: "#fff", marginTop: "10px", }}>
//                         {loading ? (
//                             <tr><td colSpan="16" className="text-center py-3">Loading...</td></tr>
//                         ) : currentData.length === 0 ? (
//                             <tr><td colSpan="16" className="text-center py-3 text-muted">No vehicles found</td></tr>
//                         ) : (
//                             currentData.map((vehicle, index) => (
//                                 <tr key={vehicle.vehicles_id || index}>
//                                     <td>{vehicle.vehicles_id}</td>
//                                     <td>{vehicle.vehicles_name}</td>
//                                     <td>{vehicle.vehicles_type}</td>
//                                     <td>{vehicle.brand}</td>
//                                     <td>{vehicle.model_name}</td>
//                                     <td>{vehicle.vehicles_number}</td>
//                                     <td>{vehicle.vehicles_register_date?.split("T")[0] || "-"}</td>
//                                     <td>{vehicle.vehicles_condition}</td>
//                                     <td>{vehicle.number_of_seats}</td>
//                                     <td>{vehicle.number_of_doors}</td>
//                                     <td>{vehicle.total_rows}</td>
//                                     <td>{vehicle.total_columns}</td>
//                                     <td>{vehicle.passenger_capacity}</td>
//                                     <td>
//                                         {vehicle.vehicle_image
//                                             ? <img src={vehicle.vehicle_image} alt="vehicle" width="80" height="50" className="rounded border" />
//                                             // ? <img src={`http://localhost:3300/uploads/${getFileName(vehicle.vehicle_image)}`} alt="vehicle" width="80" height="50" className="rounded border" />
//                                             : <span className="text-muted">N/A</span>}
//                                     </td>
//                                     <td>
//                                         {vehicle.status === "Active" ? (
//                                             <span className="badge bg-success px-3 py-2 fs-6">Active</span>
//                                         ) : vehicle.status === "Inactive" ? (
//                                             <span className="badge bg-danger px-3 py-2 fs-6">Stopped</span>
//                                         ) : (
//                                             <span className="badge bg-warning px-3 py-2 fs-6">Under Maintenance</span>
//                                         )}
//                                     </td>
//                                     <td>{vehicle.adduid}</td>

//                                     {isAdmin && (<>
//                                         <td>
//                                             <div className="d-flex justify-content-center">
//                                                 <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(vehicle)}><PencilSquare /></button>
//                                                 <button className="btn btn-sm btn-danger" onClick={() => handleDelete(vehicle.vehicles_id)}><Trash /></button>
//                                             </div>
//                                         </td>
//                                     </>)}

//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Pagination */}
//             <Pagination
//                 currentPage={currentPage}
//                 totalItems={totalPages.length}
//                 itemsPerPage={itemsPerPage}
//                 onPageChange={setCurrentPage}
//             />
//         </div>
//     );
// }

// export default Vehicles;
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../AuthContext';
import CONFIG from '../Config';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import Pagination from '../components/Pagination';
import ROLES from '../Role';
import useVehicles from "../Hooks/useVehicles";

function Vehicles() {
    const { token, user } = useContext(AuthContext);

    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [files, setFiles] = useState([]); // ✅ multiple files
    const fileInputRef = useRef();

    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        vehicles_name: '',
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
        vehicle_image: [], // ✅ array
        status: 'Active',
    });

    const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role_id);
    const { vehicles, loading, fetchVehicles } = useVehicles();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = () => {
        setFormData({
            vehicles_name: '',
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
            vehicle_image: [],
            status: 'Active',
        });
        setFiles([]);
        setEditId(null);
        setShowForm(true);
    };

    const handleEdit = (vehicle) => {
        const formattedDate = vehicle.vehicles_register_date
            ? new Date(vehicle.vehicles_register_date).toISOString().split('T')[0]
            : '';

        let images = [];

        try {
            // try parse JSON (multiple images)
            images = JSON.parse(vehicle.vehicle_image);
        } catch (err) {
            // fallback for single image
            images = vehicle.vehicle_image ? [vehicle.vehicle_image] : [];
        }

        setFormData({
            ...vehicle,
            vehicles_register_date: formattedDate,
            vehicle_image: images
        });

        setFiles([]);
        setEditId(vehicle.vehicles_id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete vehicle?')) return;

        await fetch(`${CONFIG.API_BASE_URL}/vehicles/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        fetchVehicles();
    };

    // ✅ Multiple file handler
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);

        const previewURLs = selectedFiles.map(file => URL.createObjectURL(file));

        setFormData(prev => ({
            ...prev,
            vehicle_image: previewURLs
        }));
    };

    // ✅ Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = editId ? 'PUT' : 'POST';
        const url = editId
            ? `${CONFIG.API_BASE_URL}/vehicles/${editId}`
            : `${CONFIG.API_BASE_URL}/vehicles`;

        const form = new FormData();

        Object.keys(formData).forEach(key => {
            if (key !== "vehicle_image") {
                form.append(key, formData[key]);
            }
        });

        form.append("adduid", user?.user_id);

        // ✅ multiple images
        files.forEach(file => {
            form.append("images", file);
        });

        const res = await fetch(url, {
            method,
            headers: { Authorization: `Bearer ${token}` },
            body: form
        });

        if (res.ok) {
            alert(editId ? "Updated!" : "Added!");
            setShowForm(false);
            fetchVehicles();
            setFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
            alert("Error");
        }
    };

    // Filters
    const filteredData = vehicles
        .filter(v => v.record_status === 1)
        .filter(v => statusFilter ? v.status === statusFilter : true)
        .filter(v => searchTerm ? v.vehicles_number?.toLowerCase().includes(searchTerm.toLowerCase()) : true);

    const indexOfLast = currentPage * itemsPerPage;
    const currentData = filteredData.slice(indexOfLast - itemsPerPage, indexOfLast);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="container-fluid">

            <div className="d-flex justify-content-between mb-3">
                <h2>Vehicles</h2>
                <button className="btn btn-success" onClick={handleAdd}>Add Vehicle</button>
            </div>

            {/* FORM */}
            {/* FORM */}
            {showForm && (
                <div className="card p-3 mb-3">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">

                            {/* Vehicle Name */}
                            <div className="col-md-3">
                                <label className="form-label">Vehicle Name</label>
                                <input
                                    type="text"
                                    name="vehicles_name"
                                    className="form-control"
                                    value={formData.vehicles_name || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Vehicle Type */}
                            <div className="col-md-3">
                                <label className="form-label">Vehicle Type</label>
                                <select
                                    name="vehicles_type"
                                    className="form-select"
                                    value={formData.vehicles_type || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Sleeper">Sleeper</option>
                                    <option value="AC Sleeper">AC Sleeper</option>
                                    <option value="Seater">Seater</option>
                                    <option value="AC Seater">AC Seater</option>
                                    <option value="Volvo Sleeper">Volvo Sleeper</option>
                                    <option value="Volvo Seater">Volvo Seater</option>
                                    <option value="Mini Bus Seater">Mini Bus Seater</option>
                                    <option value="Electric Seater">Electric Seater</option>
                                </select>
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
                                    name="vehicles_number"
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
                                    name="vehicles_register_date"
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
                                    name="vehicles_condition"
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

                            {/* Seats */}
                            <div className="col-md-3">
                                <label className="form-label">Seats</label>
                                <input
                                    type="number"
                                    name="number_of_seats"
                                    className="form-control"
                                    value={formData.number_of_seats || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Doors */}
                            <div className="col-md-3">
                                <label className="form-label">Doors</label>
                                <input
                                    type="number"
                                    name="number_of_doors"
                                    className="form-control"
                                    value={formData.number_of_doors || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Rows */}
                            <div className="col-md-3">
                                <label className="form-label">Rows</label>
                                <input
                                    type="number"
                                    name="total_rows"
                                    className="form-control"
                                    value={formData.total_rows || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Columns */}
                            <div className="col-md-3">
                                <label className="form-label">Columns</label>
                                <input
                                    type="number"
                                    name="total_columns"
                                    className="form-control"
                                    value={formData.total_columns || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Capacity */}
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

                            {/* Multiple Image Upload */}
                            <div className="col-md-3">
                                <label className="form-label">Vehicle Images</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    multiple
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                />
                                <small>Only JPG allowed</small>

                                <div className="mt-2 d-flex flex-wrap gap-2">
                                    {formData.vehicle_image.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            width="80"
                                            height="50"
                                            className="border rounded"
                                        />
                                    ))}
                                </div>
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


            {/* TABLE */}
            <table className="table table-bordered text-center">
                <thead className="table-dark">
                    <tr>
                        {/* <th>ID</th>
                        <th>Name</th>
                        <th>Number</th>
                        <th>Images</th>
                        <th>Status</th>
                        {isAdmin && <th>Actions</th>} */}
                        <th>ID</th>
                        <th>VEHICLE NAME</th>
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

                {/* <tbody>
                    {loading ? (
                        <tr><td colSpan="6">Loading...</td></tr>
                    ) : currentData.map(v => (
                        <tr key={v.vehicles_id}>
                            <td>{v.vehicles_id}</td>
                            <td>{v.vehicles_name}</td>
                            <td>{v.vehicles_number}</td>
                            <td>
                                {vehicles.vehicle_image ? (
                                    (() => {
                                        let images = [];
                                        try {
                                            images = JSON.parse(vehicles.vehicle_image);
                                        } catch (err) {
                                            images = [vehicles.vehicle_image];
                                        }
                                        return images.map((img, i) => (
                                            <img
                                                key={i}
                                                src={img}
                                                alt="vehicle"
                                                width="60"
                                                height="40"
                                                className="me-1 border rounded"
                                            />
                                        ));
                                    })()
                                ) : (
                                    // <span className="text-muted">N/A</span>
                                    <img
                                        // key={}
                                        src={v.vehicle_image}
                                        alt={v.vehicles_name}
                                        width="60"
                                        height="40"
                                        className="me-1 border rounded"
                                    />
                                )}
                            </td>
                            <td>{v.status}</td>
                            {isAdmin && (
                                <td>
                                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(v)}>
                                        <PencilSquare />
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.vehicles_id)}>
                                        <Trash />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody> */}

                <tbody style={{ backgroundColor: "#fff", marginTop: "10px", }}>
                    {loading ? (
                        <tr><td colSpan="16" className="text-center py-3">Loading...</td></tr>
                    ) : currentData.length === 0 ? (
                        <tr><td colSpan="16" className="text-center py-3 text-muted">No vehicles found</td></tr>
                    ) : (
                        currentData.map((vehicle, index) => (
                            <tr key={vehicle.vehicles_id || index}>
                                <td>{vehicle.vehicles_id}</td>
                                <td>{vehicle.vehicles_name}</td>
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
                                    {vehicle.vehicle_image ? (
                                        (() => {
                                            let images = [];
                                            try {
                                                images = JSON.parse(vehicle.vehicle_image);
                                            } catch (err) {
                                                images = [vehicle.vehicle_image];
                                            }
                                            return images.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img}
                                                    alt="vehicle"
                                                    width="60"
                                                    height="40"
                                                    className="me-1 border rounded"
                                                />
                                            ));
                                        })()
                                    ) : (
                                        // <span className="text-muted">N/A</span>
                                        <img
                                            // key={}
                                            src={vehicle.vehicle_image}
                                            alt={vehicle.vehicles_name}
                                            width="60"
                                            height="40"
                                            className="me-1 border rounded"
                                        />
                                    )}
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

            <Pagination
                currentPage={currentPage}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />

        </div>
    );
}

export default Vehicles;
