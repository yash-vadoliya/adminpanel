import React, { useContext, useEffect, useMemo, useState } from "react";
import CONFIG from "../Config";
import { AuthContext } from "../AuthContext";
import { Trash, Plus, PencilSquare } from "react-bootstrap-icons";
import Pagination from "../components/Pagination";
import Select from "react-select";

function DeleteAccountRequests() {
     const { token } = useContext(AuthContext);

     const [requests, setRequests] = useState([]);
     const [users, setUsers] = useState([]);
     const [drivers, setDrivers] = useState([]);

     const [showForm, setShowForm] = useState(false);
     const [editId, setEditId] = useState(null);
     const [loading, setLoading] = useState(true);

     const [currentPage, setCurrentPage] = useState(1);
     const itemsPerPage = 5;

     const [requestType, setRequestType] = useState(""); // user | driver
     const [filterType, setFilterType] = useState("all"); // all | user | driver
     const [search, setSearch] = useState("");

     const [formData, setFormData] = useState({
          user_id: 0,
          driver_id: 0,
          reason_to_delete_account: "",
          feedback: "",
          status: "pending",
     });

     /* ================= FETCH ================= */
     const fetchRequests = async () => {
          setLoading(true);
          try {
               const res = await fetch(`${CONFIG.API_BASE_URL}/deleteaccount`, {
                    headers: { Authorization: `Bearer ${token}` },
               });
               const data = await res.json();
               setRequests(data?.[0] || []);
          } catch {
               setRequests([]);
          } finally {
               setLoading(false);
          }
     };

     const fetchUsers = async () => {
          const res = await fetch(`${CONFIG.API_BASE_URL}/user`, {
               headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setUsers(data?.[0] || []);
     };

     const fetchDrivers = async () => {
          const res = await fetch(`${CONFIG.API_BASE_URL}/driver`, {
               headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setDrivers(data?.[0] || []);
     };

     useEffect(() => {
          fetchRequests();
          fetchUsers();
          fetchDrivers();
     }, []);

     /* ================= OPTIONS ================= */
     const userOptions = users.map((u) => ({
          value: u.user_id,
          label: u.user_name,
     }));

     const driverOptions = drivers.map((d) => ({
          value: d.driver_id,
          label: d.driver_name,
     }));

     const getUserName = (id) =>
          users.find((u) => u.user_id === id)?.user_name || "-";

     const getDriverName = (id) =>
          drivers.find((d) => d.driver_id === id)?.driver_name || "-";

     /* ================= FILTER + SEARCH ================= */
     const filteredData = useMemo(() => {
          return requests.filter((r) => {
               const typeMatch =
                    filterType === "all"
                         ? true
                         : filterType === "user"
                              ? r.user_id > 0
                              : r.driver_id > 0;

               const name =
                    r.user_id > 0
                         ? getUserName(r.user_id)
                         : getDriverName(r.driver_id);

               const searchMatch =
                    name.toLowerCase().includes(search.toLowerCase()) ||
                    r.reason_to_delete_account
                         ?.toLowerCase()
                         .includes(search.toLowerCase());

               return typeMatch && searchMatch;
          });
     }, [requests, filterType, search]);

     /* ================= PAGINATION ================= */
     const startIndex = (currentPage - 1) * itemsPerPage;
     const paginatedData = filteredData.slice(
          startIndex,
          startIndex + itemsPerPage
     );

     /* ================= HANDLERS ================= */
     const handleCreate = () => {
          setEditId(null);
          setRequestType("");
          setFormData({
               user_id: 0,
               driver_id: 0,
               reason_to_delete_account: "",
               feedback: "",
               status: "pending",
          });
          setShowForm(true);
     };

     const handleEdit = (row) => {
          setEditId(row.request_id);
          setRequestType(row.user_id > 0 ? "user" : "driver");
          setFormData(row);
          setShowForm(true);
     };

     const handleSubmit = async (e) => {
          e.preventDefault();

          const payload = {
               ...formData,
               user_id: requestType === "user" ? formData.user_id : 0,
               driver_id: requestType === "driver" ? formData.driver_id : 0,
          };

          const method = editId ? "PUT" : "POST";
          const url = editId
               ? `${CONFIG.API_BASE_URL}/deleteaccount/${editId}`
               : `${CONFIG.API_BASE_URL}/deleteaccount`;

          const res = await fetch(url, {
               method,
               headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(payload),
          });

          if (!res.ok) return alert("Failed");

          alert("Saved successfully");
          setShowForm(false);
          fetchRequests();
     };

     const handleDelete = async (id) => {
          if (!window.confirm("Delete this record?")) return;

          await fetch(`${CONFIG.API_BASE_URL}/deleteaccount/${id}`, {
               method: "DELETE",
               headers: { Authorization: `Bearer ${token}` },
          });

          fetchRequests();
     };

     /* ================= UI ================= */
     return (
          <div className="mt-4">
               <div className="d-flex justify-content-between mb-3">
                    <h3>Delete Account Requests</h3>
                    <button className="btn btn-primary" onClick={handleCreate}>
                         <Plus /> New Request
                    </button>
               </div>

               {/* FILTERS */}
               <div className="row mb-3">
                    <div className="col-md-3">
                         <select
                              className="form-select"
                              value={filterType}
                              onChange={(e) => setFilterType(e.target.value)}
                         >
                              <option value="all">All</option>
                              <option value="user">User</option>
                              <option value="driver">Driver</option>
                         </select>
                    </div>

                    <div className="col-md-4">
                         <input
                              className="form-control"
                              placeholder="Search by name or reason..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                         />
                    </div>
               </div>

               {/* FORM */}
               {showForm && (
                    <div className="card shadow p-3 mb-4">
                         <h4>{editId ? "Edit Request" : "Create Request"}</h4>

                         <form onSubmit={handleSubmit}>
                              <div className="mb-3">
                                   <label>Type</label>
                                   <select
                                        className="form-select"
                                        value={requestType}
                                        onChange={(e) => {
                                             const type = e.target.value;
                                             setRequestType(type);
                                             setFormData({
                                                  ...formData,
                                                  user_id: type === "user" ? "" : 0,
                                                  driver_id: type === "driver" ? "" : 0,
                                             });
                                        }}
                                        required
                                   >
                                        <option value="">Select</option>
                                        <option value="user">User</option>
                                        <option value="driver">Driver</option>
                                   </select>
                              </div>

                              {requestType === "user" && (
                                   <Select
                                        options={userOptions}
                                        value={userOptions.find(
                                             (u) => u.value === formData.user_id
                                        )}
                                        onChange={(o) =>
                                             setFormData({ ...formData, user_id: o.value, driver_id: 0 })
                                        }
                                   />
                              )}

                              {requestType === "driver" && (
                                   <Select
                                        options={driverOptions}
                                        value={driverOptions.find(
                                             (d) => d.value === formData.driver_id
                                        )}
                                        onChange={(o) =>
                                             setFormData({ ...formData, driver_id: o.value, user_id: 0 })
                                        }
                                   />
                              )}

                              <textarea
                                   className="form-control mt-3"
                                   placeholder="Reason"
                                   required
                                   value={formData.reason_to_delete_account}
                                   onChange={(e) =>
                                        setFormData({
                                             ...formData,
                                             reason_to_delete_account: e.target.value,
                                        })
                                   }
                              />

                              <textarea
                                   className="form-control mt-3"
                                   placeholder="Feedback"
                                   value={formData.feedback}
                                   onChange={(e) =>
                                        setFormData({ ...formData, feedback: e.target.value })
                                   }
                              />

                              <select
                                   className="form-select mt-3"
                                   value={formData.status}
                                   onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                   }
                              >
                                   <option value="pending">Pending</option>
                                   <option value="approved">Approved</option>
                                   <option value="rejected">Rejected</option>
                              </select>

                              <div className="mt-3 text-end">
                                   <button
                                        type="button"
                                        className="btn btn-secondary me-2"
                                        onClick={() => setShowForm(false)}
                                   >
                                        Cancel
                                   </button>
                                   <button className="btn btn-primary">Save</button>
                              </div>
                         </form>
                    </div>
               )}

               {/* TABLE */}
               <table className="table table-bordered text-center">
                    <thead className="table-dark">
                         <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Type</th>
                              <th>Reason</th>
                              <th>Status</th>
                              <th width="140">Action</th>
                         </tr>
                    </thead>
                    <tbody>
                         {!loading && paginatedData.length === 0 && (
                              <tr>
                                   <td colSpan="6">No Records Found</td>
                              </tr>
                         )}

                         {paginatedData.map((r) => (
                              <tr key={r.request_id}>
                                   <td>{r.request_id}</td>
                                   <td>
                                        {r.user_id > 0
                                             ? getUserName(r.user_id)
                                             : getDriverName(r.driver_id)}
                                   </td>
                                   <td>{r.user_id > 0 ? "User" : "Driver"}</td>
                                   <td>{r.reason_to_delete_account}</td>
                                   <td>
                                        <span className={`badge bg-${r.status === "approved"
                                             ? "success"
                                             : r.status === "rejected"
                                                  ? "danger"
                                                  : "warning text-dark"
                                             }`}>
                                             {r.status}
                                        </span>
                                   </td>
                                   <td>
                                        <button
                                             className="btn btn-sm btn-warning me-2"
                                             onClick={() => handleEdit(r)}
                                        >
                                             <PencilSquare />
                                        </button>
                                        <button
                                             className="btn btn-sm btn-danger"
                                             onClick={() => handleDelete(r.request_id)}
                                        >
                                             <Trash />
                                        </button>
                                   </td>
                              </tr>
                         ))}
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

export default DeleteAccountRequests;
