import React, { useEffect, useState, useContext } from 'react';
import CONFIG from '../Config';
import WorldMap from '../components/WorldMap';
import { AuthContext } from "../AuthContext";
import { PencilSquare, Trash } from 'react-bootstrap-icons';

const Stops = () => {
    const { token, user } = useContext(AuthContext);
    const [mapType, setMapType] = useState("roadmap");
    const [stops, setStops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, seteditId] = useState(null); // ✅ unified state
    const [formData, setFormData] = useState({
        stop_name: '',
        wait_time: '',
        reach_time: '',
        is_minor: 0,
        latitude: '',
        longitude: '',
        radius_in_meters: '',
        route_id: ''
    });
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default India center
    const [selectedStop, setSelectedStop] = useState(null);


    useEffect(() => {
        fetchStops();
    }, []);

    const fetchStops = async () => {
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (
                res.ok) {
                const data = await res.json()
                console.error("Backend response error:", await res.text());
                setLoading(false);
                return;
            }

            const data = await res.json();
            let flattenedStops = data.flat();
            flattenedStops = flattenedStops.filter(item => item.stop_id && item.latitude && item.longitude);
            setStops(flattenedStops);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching stops:", err);
            setLoading(false);
        }
    };

    const handleSearch = e => setSearch(e.target.value);

    const filteredStops = stops.filter(stop =>
        stop.stop_name.toLowerCase().includes(search.toLowerCase())
    );

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = () => {
        setFormData({
            stop_name: '',
            wait_time: '',
            reach_time: '',
            is_minor: 0,
            latitude: '',
            longitude: '',
            radius_in_meters: '',
            route_id: ''
        });
        seteditId(null);
        setShowForm(true);
    };

    const handleEdit = stop => {
        seteditId(stop.stop_id);
        setFormData({
            stop_name: stop.stop_name,
            wait_time: stop.wait_time,
            reach_time: stop.reach_time,
            is_minor: stop.is_minor,
            latitude: stop.latitude,
            longitude: stop.longitude,
            radius_in_meters: stop.radius_in_meters,
            route_id: stop.route_id
        });
        setShowForm(true);
    };

    const handleDelete = async stop_id => {
        if (!window.confirm("Are you sure you want to delete this stop?")) return;
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop/${stop_id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) fetchStops();
            window.location.reload();
        } catch (err) {
            console.error("Error deleting stop:", err);
        }

    };

    const handleSubmit = async e => {
        e.preventDefault();
        const method = editId ? "PUT" : "POST";
        const url = editId
            ? `${CONFIG.API_BASE_URL}/route_stop/${editId}`
            : `${CONFIG.API_BASE_URL}/route_stop`;

        try {
            const payload = {
                ...formData,
                adduid: user?.user_id || null,
            };

            console.log("Submitting payload:", payload);

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            fetchStops();
            if (res.ok) {
                alert(editId ? "Stop updated successfully!" : "Stop created successfully!");
                seteditId(null);
                setShowForm(false);
            } else {
                console.error("Request failed:", await res.json());
            }
        } catch (err) {
            console.error("Error submitting form:", err);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Stops</h2>
                <button className="btn btn-success" onClick={handleCreate}>Add Stop</button>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control w-50"
                    placeholder="Search stop by name"
                    value={search}
                    onChange={handleSearch}
                />
            </div>

            {showForm && (
                <div className="card mb-3 p-3">
                    <h5>{editId ? "Update Stop" : "Create Stop"}</h5>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Stop Name</label>
                            <input type="text" className="form-control" name="stop_name" value={formData.stop_name} onChange={handleInputChange} required />

                            <label>Stop Waiting Time</label>
                            <input type="time" className="form-control" name="wait_time" value={formData.wait_time} onChange={handleInputChange} required />

                            <label>Stop Reach Time</label>
                            <input type="time" className="form-control" name="reach_time" value={formData.reach_time} onChange={handleInputChange} required />

                            <label>Is Minor</label>
                            <input type="number" className="form-control" name="is_minor" value={formData.is_minor} onChange={handleInputChange} />

                            <label>Stop Radius In Meters</label>
                            <input type="number" className="form-control" name="radius_in_meters" value={formData.radius_in_meters} onChange={handleInputChange} />

                            <label>Stop Route Id</label>
                            <input type="number" className="form-control" name="route_id" value={formData.route_id} onChange={handleInputChange} required />

                            <label>Stop Latitude</label>
                            <input type="text" className="form-control" name="latitude" value={formData.latitude} onChange={handleInputChange} required />

                            <label>Stop Longitude</label>
                            <input type="text" className="form-control" name="longitude" value={formData.longitude} onChange={handleInputChange} required />
                        </div>

                        <button type="submit" className="btn btn-primary">{editId ? "Update" : "Create"}</button>
                        <button type="button" className="btn btn-secondary ms-2" onClick={() => { setShowForm(false); seteditId(null); }}>Cancel</button>
                    </form>
                </div>
            )}

            <div className="container-fluid mt-3">
                <div className="row">
                    {/* LEFT: Stops List */}
                    <div className="col-md-4">
                        <div className="card shadow-lg border-0 pb-3 vh-100 overflow-auto">
                            <div className="card-body">
                                <h5 className="card-title">Stops</h5>
                                {loading ? (
                                    <p>Loading...</p>
                                ) : filteredStops.length === 0 ? (
                                    <p>No stops available</p>
                                ) : (
                                    <ul className="list-group">
                                        {filteredStops
                                            .filter(stop => stop.record_status === 1)
                                            .map(stop => ( 
                                            <li key={stop.stop_id} className="list-group-item d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className='card-title'><strong>{stop.stop_name}</strong></div>
                                                    <div className="card-text">Latitude: {stop.latitude}</div>
                                                    <div className="card-text">Longitude: {stop.longitude}</div>
                                                    <div className="card-text">Wait Time: {stop.wait_time}</div>
                                                    <div className="card-text">Radius: {stop.radius_in_meters}</div>
                                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(stop)}><PencilSquare /></button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(stop.stop_id)}><Trash /></button>
                                                    <button
                                                        className="btn btn-sm btn-info me-2"
                                                        onClick={() => {
                                                            setMapCenter([parseFloat(stop.latitude), parseFloat(stop.longitude)])
                                                            setSelectedStop(stop)
                                                        }}
                                                    >
                                                        Show Location
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Map */}
                    <div className="col-md-8">
                        <div className="card shadow-lg border-0 p-3 vh-100">
                            <div className="mb-3">
                                <button
                                    className={`btn me-2 ${mapType === "roadmap" ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => setMapType("roadmap")}
                                >
                                    Roadmap
                                </button>
                                <button
                                    className={`btn ${mapType === "satellite" ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => setMapType("satellite")}
                                >
                                    Satellite
                                </button>
                            </div>

                            <WorldMap
                                center={mapCenter}
                                zoom={5}
                                mapType={mapType}
                                markers={selectedStop
                                    ? [
                                        {
                                            position: [parseFloat(selectedStop.latitude), parseFloat(selectedStop.longitude)],
                                            // icon: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/icons/geo-alt-fill.svg",
                                        },
                                    ]
                                    : [] }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Stops;
