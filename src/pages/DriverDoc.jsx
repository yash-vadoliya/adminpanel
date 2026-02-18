import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../AuthContext';
import CONFIG from '../Config';
import Pagination from '../components/Pagination';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import useDrivers from "../Hooks/useDriver";
import ROLES from '../Role';

function DriverDoc() {
     const { token, user } = useContext(AuthContext);
     const [docs, setDocs] = useState([]);
     const [loading, setLoading] = useState(false);
     const [currentPage, setCurrentPage] = useState(1);
     const [itemsPerPage] = useState(10);
     // const [file, setFile] = useState(null);
     const [showForm, setShowForm] = useState(false);
     const [editID, setEditID] = useState(null);

     const [profileFile, setProfileFile] = useState(null);
     const [licenceFile, setLicenceFile] = useState(null);


     const isAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(user?.role_id);

     const [formdata, setFormData] = useState({
          driver_id: "",
          licence_number: "",
          licence_image: "",
          profile_image: "",
          status: "",
          adduid: "",
     })

     const { drivers } = useDrivers(token);

     const getDriverName = (id) =>
          drivers.find((d) => d.driver_id === id)?.driver_name || "-";

     const fetchDocs = async () => {
          setLoading(true);
          try {
               const res = await fetch(`${CONFIG.API_BASE_URL}/driver-docs`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
               });
               const data = await res.json();
               console.log(data);
               // setDocs(data[0]);
               setDocs(Array.isArray(data) ? data : []);

          } catch (err) {
               console.log("Error to Fetch Data : ", err);
          } finally {
               setLoading(false);
          }
     }

     useEffect(() => {
          fetchDocs();
          return () => {
               URL.revokeObjectURL(formdata.profile_image);
               URL.revokeObjectURL(formdata.licence_image);
          };
     }, [])

     const handleEdit = (docs) => {
          const { adduid, adddate, deleteuid, deletedate, record_status, created_at, updated_at, ...rest } = docs;

          setFormData({
               // driver_id: getDriverName(formdata.driver_id),
               // licence_number: formdata.licence_number,
               // licence_image: formdata.licence_image,
               // profile_image: formdata.profile_image,
               // status: formdata.status,
               // adduid: formdata.adduid,
               ...rest
          })
          setEditID(docs.id);
          setShowForm(true);
     }

     const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
     }

     const handleProfileChange = (e) => {
          const file = e.target.files[0];
          setProfileFile(file);
          setFormData(prev => ({
               ...prev,
               profile_image: URL.createObjectURL(file)
          }));
     };

     const handleLicenceChange = (e) => {
          const file = e.target.files[0];
          setLicenceFile(file);
          setFormData(prev => ({
               ...prev,
               licence_image: URL.createObjectURL(file)
          }));
     };

     const handleAdd = () => {
          setFormData({
               driver_id: "",
               licence_number: "",
               licence_image: "",
               profile_image: "",
               status: "",
               adduid: "",
          })
          setEditID(null);
          setShowForm(true)
     }

     const handleDelete = async (id) => {
          if (!window.confirm('Are you sure you want to delete this Document?')) return;
          try {
               const res = await fetch(`${CONFIG.API_BASE_URL}/driver-docs/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
               });
               if (res.ok) fetchDocs();
               // window.location.reload();
          } catch (err) {
               console.error(err);
          }
     };

     // const handleSubmit = async (e) => {
     //      e.preventDefault();

     //      const method = editID ? 'PUT' : 'POST';
     //      const url = editID
     //           ? `${CONFIG.API_BASE_URL}/driver-docs/${editID}`
     //           : `${CONFIG.API_BASE_URL}/driver-docs`;


     //      const formData = new FormData();
     //      formData.append("driver_id", formdata.driver_id);
     //      formData.append("licence_number", formdata.licence_number);
     //      formData.append("status", formdata.status);
     //      formData.append("adduid", user?.user_id || "");

     //      if (profileFile) {
     //           formData.append("profile_image", profileFile);
     //      }
     //      if (licenceFile) {
     //           formData.append("licence_image", licenceFile);
     //      }


     //      try {
     //           const res = await fetch(url, {
     //                method,
     //                headers: {
     //                     // "Content-Type": "application/json",
     //                     Authorization: `Bearer ${token}`,
     //                },
     //                body: formData,
     //           });

     //           if (res.ok) {
     //                alert(editID ? 'Document updated!' : 'Document added!');
     //                setShowForm(false);
     //                fetchDocs();
     //           } else {
     //                const message = `${editID ? 'Document Not update!' : 'Document Not add!'} Check Console..`;
     //                alert(message);

     //                const err = await res.json();
     //                console.log(err);
     //                alert('Error: ' + (err.error || 'Unknown error'));
     //           }
     //      } catch (err) {
     //           console.log(err);
     //      }
     // }


     const handleSubmit = async (e) => {
          e.preventDefault();

          const method = editID ? "PUT" : "POST";
          const url = editID
               ? `${CONFIG.API_BASE_URL}/driver-docs/${editID}`
               : `${CONFIG.API_BASE_URL}/driver-docs`;

          const formData = new FormData();
          formData.append("driver_id", formdata.driver_id);
          formData.append("licence_number", formdata.licence_number);
          formData.append("status", formdata.status);
          formData.append("adduid", user?.user_id || "");

          if (profileFile) formData.append("profile_image", profileFile);
          if (licenceFile) formData.append("licence_image", licenceFile);

          try {
               const res = await fetch(url, {
                    method,
                    headers: {
                         Authorization: `Bearer ${token}`,
                    },
                    body: formData,
               });

               const data = await res.json();

               if (res.ok) {
                    alert(editID ? "Document updated!" : "Document added!");
                    setShowForm(false);
                    fetchDocs();
               } else {
                    alert(editID ? "Document not updated!" : "Document not added!");
                    console.error(data);
               }
          } catch (err) {
               console.error("Submit Error:", err);
          }
     };

     // Filter Data
     // const safeDocs = Array.isArray(docs) ? docs : [];
     // const filteredData = safeDocs.filter(d => Number(d.record_status) === 1);


     // Pagination 
     const indexOfLast = currentPage * itemsPerPage;
     const indexOfFirst = indexOfLast - itemsPerPage;

     // const safeDocs = Array.isArray(docs) ? docs : [];

     const currentData = docs.slice(indexOfFirst, indexOfLast);
     const totalPages = Math.ceil(docs.length / itemsPerPage);

     return (
          <div className='container-fluid'>
               <div className="d-flex justify-content-between align-item-center mb-3">
                    <h2>Driver Document</h2>
                    <button className='btn btn-success' onClick={handleAdd} >+ Add Documents</button>
               </div>

               {showForm && (
                    <div className="card mb-3 p-3 shadow">
                         <h5>{editID ? "Update" : "Add"} Driver Documenets</h5>

                         <form onSubmit={handleSubmit}>
                              <div className="row g-3">
                                   <div className="col-md-3">
                                        <label className="form-label">Driver </label>
                                        <select
                                             name="driver_id"
                                             className="form-control"
                                             value={formdata.driver_id}
                                             onChange={handleChange}
                                             required
                                        >
                                             <option value="">Select Driver</option>
                                             {drivers.map((d) => (
                                                  <option key={d.driver_id} value={d.driver_id}>
                                                       {d.driver_name}
                                                  </option>
                                             ))}
                                        </select>
                                   </div>

                                   <div className="col-md-4 mb-2">
                                        <label className="form-label">Licence Number</label>
                                        <input
                                             type="text"
                                             name='licence_number'
                                             className='form-control'
                                             value={formdata.licence_number}
                                             onChange={handleChange}
                                             required
                                        />
                                   </div>
                                   <div className="col-md-4 mb-2">
                                        <label className="form-label">Status</label>
                                        <select
                                             name="status"
                                             className="form-control"
                                             value={formdata.status}
                                             onChange={handleChange}
                                             required
                                        >
                                             <option value="active">Active</option>
                                             <option value="inactive">Inactive</option>
                                        </select>
                                   </div>
                                   <div className="col-md-4 mb-2">
                                        <label className="form-label">Profile Image</label>
                                        <input
                                             type="file"
                                             className='form-control'
                                             onChange={handleProfileChange}
                                        // value={formdata.profile_image}
                                        />
                                        {formdata.profile_image && (
                                             <div className="mt-2 text-center">
                                                  <img
                                                       src={formdata.profile_image}
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
                                   <div className="col-md-4 mb-2">
                                        <label className="form-label">Licence Image</label>
                                        <input
                                             type="file"
                                             className='form-control'
                                             onChange={handleLicenceChange}
                                        // value={formdata.licence_image}
                                        />
                                        {formdata.licence_image && (
                                             <div className="mt-2 text-center">
                                                  <img
                                                       src={formdata.licence_image}
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
                              </div>
                              <div className="mt-3 ">
                                   <button className="btn btn-success me-2">
                                        {editID ? "Update" : "Save"}
                                   </button>
                                   <button type="button" className="btn btn-secondary me-2" onClick={() => setShowForm(false)}>
                                        Cancel
                                   </button>
                              </div>
                         </form>
                    </div>
               )}

               <div className="table-responsive mt-3" style={{ overflowX: "auto" }}>
                    <table className="table table-bordered align-middle text-center shadow-sm rounded-3" style={{ borderRadius: "12px", overflow: "hidden" }}>
                         <thead className='table-dark' >
                              <tr>
                                   <th>ID</th>
                                   <th>Driver Name</th>
                                   <th>Licence Number</th>
                                   <th>Licence Image</th>
                                   <th>Profile Image</th>
                                   <th>Status</th>
                                   {isAdmin && (<>
                                        <th>Action</th>
                                   </>)}
                              </tr>
                         </thead>
                         <tbody>
                              {loading ? (
                                   <tr>
                                        <td colSpan="7">Loading...</td>
                                   </tr>
                              ) : currentData.length === 0 ? (
                                   <tr>
                                        <td colSpan="7">No Driver Document Found</td>
                                   </tr>
                              ) : (
                                   currentData
                                        .filter((d) => Number(d.record_status) === 1)
                                        .map((doc) => (
                                             <tr key={doc.id}>
                                                  <td>{doc.id}</td>
                                                  <td>{getDriverName(doc.driver_id)}</td>
                                                  <td>{doc.licence_number}</td>
                                                  <td>{doc.licence_image ? <img src={doc.licence_image} width="60" /> : "-"}</td>
                                                  <td>{doc.profile_image ? <img src={doc.profile_image} width="60" /> : "-"}</td>
                                                  <td>
                                                       {Number(doc.status) === 1 ? (
                                                            <span className="badge bg-success">Active</span>
                                                       ) : (
                                                            <span className="badge bg-danger">Inactive</span>
                                                       )}
                                                  </td>
                                                  {isAdmin && (<>
                                                       <td>
                                                            <div className="d-flex justify-content-center">
                                                                 <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(doc)}>
                                                                      <PencilSquare />
                                                                 </button>
                                                                 <button className="btn btn-sm btn-danger me-2" onClick={() => handleDelete(doc.id)}>
                                                                      <Trash />
                                                                 </button>
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
                    totalItems={docs.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
               />

          </div>
     )
}

export default DriverDoc;