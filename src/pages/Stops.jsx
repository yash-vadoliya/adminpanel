// import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
// // import CONFIG from "../Config";
// import WorldMap from "../components/WorldMap";
// import MapPicker from "../components/MapPicker";
// import { AuthContext } from "../AuthContext";
// import { PencilSquare, Trash } from "react-bootstrap-icons";
// import Select from "react-select";
// import ROLES from "../Role";
// import Pagination from "../components/Pagination";
// // Hook Import
// import useStops from "../Hooks/useStops";
// import useCity from "../Hooks/useCities";

// const Stops = () => {
//   const { token, user } = useContext(AuthContext);

//   const [mapType, setMapType] = useState("roadmap");
//   // const [stops, setStops] = useState([]);
//   // const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(5);
//   const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
//   const [selectedStop, setSelectedStop] = useState(null);
//   // const [cityList, setCityList] = useState([]);

//   const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role_id);

//   // use Hook
//   const { stops, fetchStops, saveStop, deleteStop, loading } = useStops();
//   const { city, fetchCity } = useCity();

//   const [formData, setFormData] = useState({
//     stop_name: "",
//     latitude: "",
//     longitude: "",
//     radius_in_meters: "",
//     city_id: "",
//     adduid: "",
//   });

//   // ------------------- Fetch City and Stops -------------------
//   useEffect(() => {
//     fetchCity();
//     fetchStops();
//   }, []);

//   // const fetchCities = async () => {
//   //   try {
//   //     const res = await fetch(`${CONFIG.API_BASE_URL}/city`, {
//   //       headers: {
//   //         "Content-type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });
//   //     const data = await res.json();
//   //     console.log(data);
//   //     setCityList(Array.isArray(data[0]) ? data[0] : data);
//   //   } catch (err) {
//   //     console.error("Error fetching cities:", err);
//   //   }
//   // };

//   // const fetchStops = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop`, {
//   //       method: "GET",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });
//   //     const data = await res.json();

//   //     const flattenedStops = Array.isArray(data)
//   //       ? data.flat().filter((item) => item.id != null)
//   //       : [];

//   //     setStops(data[0]);
//   //   } catch (err) {
//   //     console.error("Error fetching stops:", err);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // ------------------- Search -------------------
//   const handleSearch = (e) => setSearch(e.target.value);

//   const filteredStops = stops.filter((stop) =>
//     stop.stop_name?.toLowerCase().includes(search.toLowerCase())
//   );

//   // ✅ Input Handling
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSelectChange = (value, field) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value ? Number(value) : null,
//     }));
//   };

//   const onLocationChange = useCallback((location) => {
//     if (location.lat && location.lng) {
//       setFormData((prev) => ({
//         ...prev,
//         latitude: location.lat,
//         longitude: location.lng,
//       }));
//     }
//   }, []);


//   // ------------------- Create / Edit -------------------
//   const handleCreate = () => {
//     setFormData({
//       route_id: "",
//       stop_sequence: "",
//       distance_from_start: "",
//       approx_time_from_start: "",
//       stop_name: "",
//       wait_time: "",
//       reach_time: "",
//       is_minor: 0,
//       latitude: "",
//       longitude: "",
//       radius_in_meters: "",
//       city_id: "",
//     });
//     setEditId(null);
//     setShowForm(true);
//   };

//   const handleEdit = (stop) => {
//     setEditId(stop.id);
//     setFormData({
//       route_id: stop.route_id,
//       stop_sequence: stop.stop_sequence,
//       distance_from_start: stop.distance_from_start,
//       approx_time_from_start: stop.approx_time_from_start,
//       stop_name: stop.stop_name,
//       wait_time: stop.wait_time,
//       reach_time: stop.reach_time,
//       is_minor: stop.is_minor,
//       latitude: stop.latitude,
//       longitude: stop.longitude,
//       radius_in_meters: stop.radius_in_meters,
//       city_id: stop.city_id,
//     });
//     setShowForm(true);
//   };

//   // ------------------- Delete Stop -------------------
//   // const handleDelete = async (id) => {
//   //   if (!window.confirm("Are you sure you want to delete this stop?")) return;
//   //   try {
//   //     const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop/${id}`, {
//   //       method: "DELETE",
//   //       headers: { Authorization: `Bearer ${token}` },
//   //     });
//   //     if (res.ok) {
//   //       alert("Stop deleted successfully!");
//   //       fetchStops();
//   //     } else {
//   //       console.error("Failed to delete:", await res.text());
//   //       alert("Delete failed! Check console.");
//   //     }
//   //   } catch (err) {
//   //     console.error("Error deleting stop:", err);
//   //     alert("Delete failed! Check console.");
//   //   }
//   // };

//   // ------------------- Submit -------------------
//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   const method = editId ? "PUT" : "POST";
//   //   const url = editId
//   //     ? `${CONFIG.API_BASE_URL}/route_stop/${editId}`
//   //     : `${CONFIG.API_BASE_URL}/route_stop`;

//   //   try {
//   //     const payload = {
//   //       ...formData,
//   //       adduid: user?.user_id,
//   //       city_id: formData.city_id ? Number(formData.city_id) : null,
//   //     };
//   //     const res = await fetch(url, {
//   //       method,
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //       body: JSON.stringify(payload),
//   //     });
//   //     if (res.ok) {
//   //       alert(editId ? "Stop updated successfully!" : "Stop created successfully!");
//   //       setShowForm(false);
//   //       setEditId(null);
//   //       fetchStops();
//   //     } else {
//   //       console.error("Request failed:", await res.text());
//   //       alert("Operation failed! Check console for details.");
//   //     }
//   //   } catch (err) {
//   //     console.error("Error submitting form:", err);
//   //     alert("Operation failed! Check console for details.");
//   //   }
//   // };

//   // ------------------- Pagination -------------------
//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const currentData = filteredStops.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredStops.length / itemsPerPage);

//   // ------------------- Show Location On Map -------------------
//   const stopMarkers = useMemo(() => {
//     if (!selectedStop) return [];
//     const lat = parseFloat(selectedStop.latitude);
//     const lng = parseFloat(selectedStop.longitude);
//     if (isNaN(lat) || isNaN(lng)) return [];
//     return [{ lat, lng, name: selectedStop.stop_name }];
//   }, [selectedStop]);

//   // ------------------- Render -------------------
//   return (
//     <>
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h2>Stops</h2>
//         {isAdmin && (
//           <button className="btn btn-success" onClick={handleCreate}>
//             Add Stop
//           </button>
//         )}
//       </div>

//       <div className="mb-3">
//         <input
//           type="text"
//           className="form-control w-50"
//           placeholder="Search stop by name"
//           value={search}
//           onChange={handleSearch}
//         />
//       </div>

//       {/* Form */}
//       {showForm && (
//         <div className="card mb-3 p-3 shadow">
//           <h5>{editId ? "Update Stop" : "Create Stop"}</h5>
//           <form
//             onSubmit={async (e) => {
//               e.preventDefault();
//               const success = await saveStop(formData, editId);
//               if (success) {
//                 alert(editId ? "Stop updated successfully!" : "Stop created successfully!");
//                 setShowForm(false);
//                 setEditId(null);
//               } else {
//                 alert("Failed to save stop. Check console for details.");
//               }
//             }}
//           >
//             <div className="row g-3">
//               <div className="col-md-3">
//                 <label className="form-label">Stop Name</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   name="stop_name"
//                   value={formData.stop_name}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               <div className="col-md-3">
//                 <label className="form-label">Wait Time</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   name="wait_time"
//                   value={formData.wait_time}
//                   onChange={handleInputChange}
//                   placeholder="MM:SS"
//                   required
//                 />
//               </div>

//               <div className="col-md-3">
//                 <label className="form-label">Radius (meters)</label>
//                 <input
//                   type="number"
//                   className="form-control"
//                   name="radius_in_meters"
//                   value={formData.radius_in_meters}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               {/* City Select */}
//               <div className="col-md-3">
//                 <label className="form-label">City</label>
//                 <select
//                   className="form-select"
//                   name="city_id"
//                   value={formData.city_id ?? ""}
//                   onChange={(e) => handleSelectChange(e.target.value, "city_id")}
//                   required
//                 >
//                   <option value="">Select City</option>
//                   {city.map((c) => (
//                     <option key={c.city_id} value={c.city_id}>
//                       {c.city_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Map Picker */}
//               <div className="col-md-9 mt-3">
//                 <label className="form-label">Select Stop Location</label>
//                 <MapPicker
//                   latitude={formData.latitude}
//                   longitude={formData.longitude}
//                   onLocationChange={onLocationChange}
//                 />
//                 <div className="mt-2">
//                   <strong>Latitude:</strong> {formData.latitude} <br />
//                   <strong>Longitude:</strong> {formData.longitude}
//                 </div>
//               </div>
//               <div className="col-12 mt-3">
//                 <button type="submit" className="btn btn-primary me-2">
//                   {editId ? "Update" : "Create"}
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={() => {
//                     setShowForm(false);
//                     setEditId(null);
//                   }}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Stops List */}
//       <div className="container-fluid mt-3">
//         <div className="row">
//           <div className="col-md-4">
//             <div className="card shadow-lg border-0 pb-3 vh-100 overflow-auto">
//               <div className="card-body">
//                 <h5 className="card-title mb-3">Stops</h5>
//                 {loading ? (
//                   <p>Loading...</p>
//                 ) : currentData.length === 0 ? (
//                   <p>No stops available</p>
//                 ) : (
//                   <ul className="list-group">
//                     {currentData
//                       .filter((stop) => stop.record_status === 1 || stop.record_status == null)
//                       .map((stop) => (
//                         <li
//                           key={stop.id}
//                           className="list-group-item mb-3 rounded shadow-sm"
//                           style={{
//                             border: "1px solid #ddd",
//                             padding: "15px",
//                             backgroundColor: "#fafafa",
//                           }}
//                         >
//                           <div className="p-2">
//                             <div className="d-flex justify-content-between align-items-start mb-2">
//                               <span className="fw-bold me-2">ID: {stop.id}</span>
//                               <h6
//                                 className="fs-5 fw-bold mb-0 me-2"
//                                 style={{ wordBreak: "break-word" }}
//                               >
//                                 {stop.stop_name}
//                               </h6>
//                             </div>

//                             <div>Latitude: {stop.latitude}</div>
//                             <div>Longitude: {stop.longitude}</div>
//                             <div>Radius: {stop.radius_in_meters} m</div>

//                             <div className="mt-3">
//                               {isAdmin && (
//                                 <>
//                                   <button
//                                     className="btn btn-sm btn-warning me-2"
//                                     onClick={() => handleEdit(stop)}
//                                   >
//                                     <PencilSquare />
//                                   </button>
//                                   <button
//                                     className="btn btn-sm btn-danger me-2"
//                                     onClick={() => deleteStop(stop.id)}
//                                   >
//                                     <Trash />
//                                   </button>
//                                 </>
//                               )}
//                               <button
//                                 className="btn btn-sm btn-info"
//                                 onClick={() => {
//                                   setMapCenter([
//                                     parseFloat(stop.latitude),
//                                     parseFloat(stop.longitude),
//                                   ]);
//                                   setSelectedStop(stop);
//                                 }}
//                               >
//                                 Show Location
//                               </button>
//                             </div>
//                           </div>
//                         </li>
//                       ))}
//                   </ul>
//                 )}
//               </div>
//             </div>

//             {/* Pagination */}
//             <Pagination
//               currentPage={currentPage}
//               totalItems={filteredStops.length}
//               itemsPerPage={itemsPerPage}
//               onPageChange={setCurrentPage}
//             />

//           </div>

//           {/* Map */}
//           < div className="col-md-8" >
//             <div className="card shadow-lg border-0 p-3 vh-100">
//               <div className="mb-3">
//                 <button className={`btn me-2 ${mapType === "roadmap" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMapType("roadmap")}>Roadmap</button>
//                 <button className={`btn ${mapType === "satellite" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMapType("satellite")}>Satellite</button>
//               </div>
//               <WorldMap
//                 center={mapCenter}
//                 zoom={5}
//                 mapType={mapType}
//                 markers={stopMarkers}
//               />
//             </div>
//           </div >
//         </div>
//       </div>
//     </>
//   );
// };

// export default Stops;

import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import WorldMap from "../components/WorldMap";
import MapPicker from "../components/MapPicker";
import { AuthContext } from "../AuthContext";
import { PencilSquare, Trash } from "react-bootstrap-icons";
import ROLES from "../Role";
import Pagination from "../components/Pagination";

// Hooks
import useStops from "../Hooks/useStops";
import useCity from "../Hooks/useCities";

const Stops = () => {
  const { token, user } = useContext(AuthContext);   // ✅ TOKEN RESTORED

  const [mapType, setMapType] = useState("roadmap");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [selectedStop, setSelectedStop] = useState(null);

  const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role_id);

  const { stops, fetchStops, saveStop, deleteStop, loading } = useStops();
  const { city, fetchCity } = useCity();

  const [formData, setFormData] = useState({
    stop_name: "",
    latitude: "",
    longitude: "",
    radius_in_meters: "",
    city_id: "",
    adduid: "",
  });

  useEffect(() => {
    fetchCity();
    fetchStops();
  }, []);

  // console.log(fetchStops());

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredStops = stops.filter((stop) =>
    stop.stop_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      city_id: value ? Number(value) : null,
    }));
  };

  const onLocationChange = useCallback((location) => {
    if (location.lat && location.lng) {
      setFormData((prev) => ({
        ...prev,
        latitude: location.lat,
        longitude: location.lng,
      }));
    }
  }, []);

  // ---------- CREATE ----------
  const handleCreate = () => {
    setFormData({
      stop_name: "",
      latitude: "",
      longitude: "",
      radius_in_meters: "",
      city_id: "",
      adduid: user?.user_id,        // ✅ REQUIRED
    });
    setEditId(null);
    setShowForm(true);
  };

  // ---------- EDIT ----------
  const handleEdit = (stop) => {
    setEditId(stop.stop_id);
    setFormData({
      stop_name: stop.stop_name,
      latitude: stop.latitude,
      longitude: stop.longitude,
      radius_in_meters: stop.radius_in_meters,
      city_id: stop.city_id,
      adduid: user?.user_id,        // always updated by logged user
    });
    setShowForm(true);
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredStops.slice(indexOfFirst, indexOfLast);

  // Map Marker
  const stopMarkers = useMemo(() => {
    if (!selectedStop) return [];
    const lat = parseFloat(selectedStop.latitude);
    const lng = parseFloat(selectedStop.longitude);
    if (isNaN(lat) || isNaN(lng)) return [];
    return [{ lat, lng, name: selectedStop.stop_name }];
  }, [selectedStop]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Stops</h2>
        {isAdmin && (
          <button className="btn btn-success" onClick={handleCreate}>
            Add Stop
          </button>
        )}
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

      {/* ------------ FORM ------------ */}
      {showForm && (
        <div className="card mb-3 p-3 shadow">
          <h5>{editId ? "Update Stop" : "Create Stop"}</h5>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const success = await saveStop(formData, editId, token);  // ✅ SEND TOKEN

              if (success) {
                alert(editId ? "Stop Updated successfully!" : "Stop Added successfully!");
                setShowForm(false);
                setEditId(null);
                fetchStops();
              }
            }}
          >
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Stop Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="stop_name"
                  value={formData.stop_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Radius (meters)</label>
                <input
                  type="number"
                  className="form-control"
                  name="radius_in_meters"
                  value={formData.radius_in_meters}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* City */}
              <div className="col-md-3">
                <label className="form-label">City</label>
                <select
                  className="form-select"
                  name="city_id"
                  value={formData.city_id ?? ""}
                  onChange={(e) => handleSelectChange(e.target.value)}
                  required
                >
                  <option value="">Select City</option>
                  {city.map((c) => (
                    <option key={c.city_id} value={c.city_id}>
                      {c.city_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Map Picker */}
              <div className="col-md-12 mt-3" >
                <label className="form-label">Select Stop Location</label>
                <MapPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={onLocationChange}
                />
                <div className="mt-2">
                  <strong>Latitude:</strong> {formData.latitude} <br />
                  <strong>Longitude:</strong> {formData.longitude}
                </div>
              </div>

              <div className="col-12 mt-3">
                <button type="submit" className="btn btn-primary me-2">
                  {editId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ---------- LIST ---------- */}
      <div className="container-fluid mt-3">
        <div className="row">
          <div className="col-md-4">
            <div className="card shadow-lg border-0 pb-3 vh-100 overflow-auto">
              <div className="card-body">
                <h5 className="card-title mb-3">Stops</h5>

                {loading ? (
                  <p>Loading...</p>
                ) : currentData.length === 0 ? (
                  <p>No stops available</p>
                ) : (
                  <ul className="list-group">
                    {currentData
                    .filter((stop) => stop.record_status === 1)
                    .map((stop) => (
                      <li key={stop.stop_id} className="list-group-item mb-3 rounded shadow-sm">
                        <div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>ID: {stop.stop_id}</span>
                            <strong>{stop.stop_name}</strong>
                          </div>

                          <div>Lat: {stop.latitude}</div>
                          <div>Lng: {stop.longitude}</div>
                          <div>Radius: {stop.radius_in_meters} m</div>

                          <div className="mt-3">
                            {isAdmin && (
                              <>
                                <button
                                  className="btn btn-sm btn-warning me-2"
                                  onClick={() => handleEdit(stop)}
                                >
                                  <PencilSquare />
                                </button>
                                <button
                                  className="btn btn-sm btn-danger me-2"
                                  onClick={() => deleteStop(stop.stop_id, token)}  // ✅ SEND TOKEN
                                >
                                  <Trash />
                                </button>
                              </>
                            )}

                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => {
                                setMapCenter([
                                  parseFloat(stop.latitude),
                                  parseFloat(stop.longitude),
                                ]);
                                setSelectedStop(stop);
                              }}
                            >
                              Show Location
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredStops.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* Map */}
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
                markers={stopMarkers}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Stops;
