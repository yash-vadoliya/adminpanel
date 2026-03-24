import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import CONFIG from '../Config';
import useDrivers from "../Hooks/useDriver";
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import '../App.css';

function DriverDoc() {
     const { token } = useContext(AuthContext);
     const { drivers } = useDrivers(token);
     const [docs, setDocs] = useState([]);
     const [showForm, setShowForm] = useState(false);
     const [editID, setEditID] = useState(null);
     const [formData, setFormData] = useState({
          driver_id: "", licence_number: "", id_number: "", status: "1",
          licence_image: null, id_image: null, profile_image: null
     });

     const fetchDocs = async () => {
          try {
               const res = await fetch(`${CONFIG.API_BASE_URL}/driver-docs`, {
                    headers: { Authorization: `Bearer ${token}` }
               });
               const data = await res.json();
               console.log(data);
               setDocs(Array.isArray(data) ? data : []);
          } catch (e) { console.error("Fetch error", e); }
     };

     useEffect(() => { fetchDocs(); }, []);

     const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
     const handleFileChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.files[0] });

     const handleSubmit = async (e) => {
          e.preventDefault();
          const data = new FormData();
          data.append("driver_id", formData.driver_id);
          data.append("licence_number", formData.licence_number);
          data.append("id_number", formData.id_number);
          data.append("status", formData.status);

          if (formData.licence_image) data.append("licence_image", formData.licence_image);
          if (formData.id_image) data.append("id_image", formData.id_image);
          if (formData.profile_image) data.append("profile_image", formData.profile_image);

          try {
               const url = editID ? `${CONFIG.API_BASE_URL}/driver-docs/${editID}` : `${CONFIG.API_BASE_URL}/driver-docs`;
               const method = editID ? "PUT" : "POST";

               const res = await fetch(url, {
                    method,
                    headers: { "Authorization": `Bearer ${token}` }, // IMPORTANT: No Content-Type here
                    body: data
               });

               const result = await res.json();
               if (res.ok) {
                    alert(editID ? "Updated Successfully" : "Added Successfully");
                    setShowForm(false);
                    fetchDocs();
               } else {
                    alert("Error: " + (result.error || "Failed to save"));
               }
          } catch (err) { alert("Server Connection Error"); }
     };

     const handleEdit = (d) => {
          setFormData({ ...d, licence_image: null, id_image: null, profile_image: null });
          setEditID(d.id);
          setShowForm(true);
     };

     const handleDelete = async (id) => {
          if (!window.confirm("Delete this document?")) return;
          try {
               const res = await fetch(`${CONFIG.API_BASE_URL}/driver-docs/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
               });
               if (res.ok) fetchDocs();
               else alert("Delete failed");
          } catch (e) { console.error(e); }
     };

     return (
          <div className="container mt-3">
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Driver Documents</h2>
                    <button className="btn btn-success" onClick={() => { setEditID(null); setFormData({ driver_id: "", licence_number: "", id_number: "", status: "1" }); setShowForm(true); }}>+ Add</button>
               </div>

               {showForm && (
                    <div className="card p-3 mb-4 shadow-sm">
                         <form onSubmit={handleSubmit}>
                              <div className="row g-3">
                                   <div className="col-md-4">
                                        <label>Driver</label>
                                        <select name="driver_id" className="form-control" value={formData.driver_id} onChange={handleChange} required>
                                             <option value="">Select Driver</option>
                                             {drivers.map(d => <option key={d.driver_id} value={d.driver_id}>{d.driver_name}</option>)}
                                        </select>
                                   </div>
                                   <div className="col-md-4">
                                        <label>Licence No</label>
                                        <input name="licence_number" className="form-control" value={formData.licence_number} onChange={handleChange} required />
                                   </div>
                                   <div className="col-md-4">
                                        <label>ID No</label>
                                        <input name="id_number" className="form-control" value={formData.id_number} onChange={handleChange} required />
                                   </div>
                                   <div className="col-md-4"><label>Licence Image</label><input type="file" name="licence_image" className="form-control" onChange={handleFileChange} /></div>
                                   <div className="col-md-4"><label>ID Image</label><input type="file" name="id_image" className="form-control" onChange={handleFileChange} /></div>
                                   <div className="col-md-4"><label>Profile Image</label><input type="file" name="profile_image" className="form-control" onChange={handleFileChange} /></div>
                                   <div className="col-12">
                                        <button type="submit" className="btn btn-primary">{editID ? "Update" : "Submit"}</button>
                                        <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowForm(false)}>Cancel</button>
                                   </div>
                              </div>
                         </form>
                    </div>
               )}

               {/* <table className="table table-bordered text-center">
                    <thead className="table-dark">
                         <tr>
                              <th>ID</th>
                              <th>Driver</th>
                              <th>Licence Number</th>
                              <th>ID Number</th>
                              <th>Images</th>
                              <th>Actions</th>
                         </tr>
                    </thead>
                    <tbody>
                         {docs.map(d => (
                              <tr key={d.id}>
                                   <td>{d.id}</td>
                                   <td>{drivers.find(dr => dr.driver_id === d.driver_id)?.driver_name || d.driver_id}</td>
                                   <td>{d.licence_number}</td><td>{d.id_number}</td>
                                   <td>
                                        <table>
                                             <tr>
                                                  <td>
                                                       {d.licence_image && <img src={d.licence_image} width="50" className="me-1" alt="lic" />}
                                                  </td>
                                                  <td>
                                                       {d.id_image && <img src={d.id_image} width="50" alt="id" />}

                                                  </td>
                                                  <td>
                                                       {d.profile_image && <img src={d.profile_image} width="50" alt="pro" />}

                                                  </td>
                                             </tr>
                                        </table>
                                   </td>
                                   <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(d)}><PencilSquare /></button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}><Trash /></button>
                                   </td>
                              </tr>
                         ))}
                    </tbody>
               </table> */}

               <table className="table table-bordered text-center align-middle">
                    <thead className="table-dark">
                         <tr>
                              <th>ID</th>
                              <th>Driver</th>
                              <th>Licence No</th>
                              <th>ID No</th>
                              <th>Images</th>
                              <th>Actions</th>
                         </tr>
                    </thead>
                    <tbody>
                         {docs.map((d) => (
                              <tr key={d.id}>

                                   {/* ID */}
                                   <td>{d.id}</td>

                                   {/* Driver Name */}
                                   <td>
                                        {drivers.find(dr => dr.driver_id === d.driver_id)?.driver_name || d.driver_id}
                                   </td>

                                   {/* Licence */}
                                   <td>{d.licence_number}</td>

                                   {/* ID Number */}
                                   <td>{d.id_number}</td>

                                   {/* Images */}
                                   <td>
                                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                                             {d.licence_image && (
                                                  <img src={d.licence_image} width="60" height="60" className="rounded border zoom-img" alt="licence" />
                                             )}
                                             {d.id_image && (
                                                  <img src={d.id_image} width="60" height="60" className="rounded border zoom-img" alt="id" />
                                             )}
                                             {d.profile_image && (
                                                  <img src={d.profile_image} width="60" height="60" className="rounded border zoom-img" alt="profile" />
                                             )}
                                        </div>
                                   </td>

                                   {/* Actions */}
                                   <td>
                                        <button
                                             className="btn btn-warning btn-sm me-2"
                                             onClick={() => handleEdit(d)}
                                        >
                                             <PencilSquare />
                                        </button>

                                        <button
                                             className="btn btn-danger btn-sm"
                                             onClick={() => handleDelete(d.id)}
                                        >
                                             <Trash />
                                        </button>
                                   </td>
                              </tr>
                         ))}
                    </tbody>
               </table>

          </div>
     );
}

export default DriverDoc;