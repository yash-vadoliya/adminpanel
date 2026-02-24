import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";
import { PencilSquare, Trash } from "react-bootstrap-icons";
import useCancellation from "../Hooks/useCencellation";

function Cancellation() {
  const { token, user } = useContext(AuthContext);

  const [thresholds, setThresholds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    policy_id: "",
    name: "",
    status: "Active",
  });

  const { policies, fetchPolicies, loading } = useCancellation();

  const [thresholdList, setThresholdList] = useState([
    { min_time: "", max_time: "", refund: "" },
  ]);

  // Fetch thresholds
  const fetchThresholds = async () => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/thresholds`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setThresholds(data[0] || []);
    } catch (err) {
      console.error("fetchThresholds error:", err);
    }
  };

  useEffect(() => {
    fetchPolicies();
    fetchThresholds();
  }, [fetchPolicies]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleThresholdChange = (index, e) => {
    const { name, value } = e.target;
    setThresholdList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  const addThresholdRow = () =>
    setThresholdList((prev) => [...prev, { min_time: "", max_time: "", refund: "" }]);

  const removeThresholdRow = (index) => {
    setThresholdList((prev) => prev.filter((_, i) => i !== index));
  };

  const markThresholdForDelete = (index) => {
    setThresholdList((prev) =>
      prev.map((t, i) => (i === index ? { ...t, _delete: !t._delete } : t))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name,
        status: formData.status,
        travel_id: user?.travel_id || null,
        adduid: user?.user_id || null,
        thresholds: thresholdList,
      };

      const method = editMode ? "PUT" : "POST";
      const url = editMode
        ? `${CONFIG.API_BASE_URL}/cancel/${formData.policy_id}`
        : `${CONFIG.API_BASE_URL}/cancel`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Failed to save policy");
        return;
      }

      const policy_id = editMode
        ? Number(formData.policy_id)
        : Number(result.policy_id);

      if (policy_id) {
        for (let t of thresholdList) {
          // DELETE
          if (t._delete && t.id) {
            await fetch(`${CONFIG.API_BASE_URL}/thresholds/${t.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            continue;
          }

          // UPDATE
          if (t.id && !t._delete) {
            await fetch(`${CONFIG.API_BASE_URL}/thresholds/${t.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                min_time: t.min_time,
                max_time: t.max_time,
                refund: t.refund,
                policy_id,
                adduid: user?.user_id || null,
              }),
            });
            continue;
          }

          // INSERT
          if (!t.id && !t._delete) {
            await fetch(`${CONFIG.API_BASE_URL}/thresholds`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                min_time: t.min_time,
                max_time: t.max_time,
                refund: t.refund,
                policy_id,
                adduid: user?.user_id || null,
              }),
            });
          }
        }
      }

      alert(editMode ? "Policy updated!" : "Policy added!");
      handleCloseForm();
      fetchPolicies();
      fetchThresholds();
    } catch (err) {
      console.error("handleSubmit error:", err);
      alert("An error occurred.");
    }
  };

  const handleEdit = (policy) => {
    setShowForm(true);
    setEditMode(true);

    setFormData({
      policy_id: policy.policy_id,
      name: policy.name,
      status: policy.status,
    });

    const existing = thresholds
      .filter((t) => t.policy_id === policy.policy_id)
      .map((t) => ({
        id: t.id,
        policy_id: t.policy_id,
        min_time: t.min_time,
        max_time: t.max_time,
        refund: t.refund,
        adduid: t.adduid,
      }));

    setThresholdList(
      existing.length ? existing : [{ min_time: "", max_time: "", refund: "" }]
    );
  };

  const handleDelete = async (policy_id) => {
    if (!window.confirm("Delete this policy?")) return;

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/cancel/${policy_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        alert("Failed to delete");
      } else {
        alert("Policy deleted");
        fetchPolicies();
        fetchThresholds();
      }
    } catch (err) {
      console.error("handleDelete error:", err);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditMode(false);
    setFormData({ policy_id: "", name: "", status: "Active" });
    setThresholdList([{ min_time: "", max_time: "", refund: "" }]);
  };

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h2>Cancellation Policy</h2>
        <button
          className="btn btn-success"
          onClick={() => {
            // setShowForm(true);
            setShowForm((s) => !s);
            // if (!showForm) handleCloseForm();
          }}
        >
          {showForm ? "Close" : "Add Policy"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card p-3 shadow mb-3">
          <h5>{editMode ? "Edit Policy" : "Add New Policy"}</h5>

          <form onSubmit={handleSubmit}>

            {/* --- Policy Input Section --- */}
            <div className="row mb-3">
              <div className="col-md-5">
                <label className="form-label">Policy Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            <h6 className="mt-3">Threshold Rules</h6>

            {/* --- Threshold Rows --- */}
            {thresholdList.map((t, idx) => (
              <div className="row g-2 align-items-center mb-2" key={idx}>
                <div className="col-md-3">
                  <input
                    name="min_time"
                    value={t.min_time}
                    onChange={(e) => handleThresholdChange(idx, e)}
                    className="form-control"
                    placeholder="Min Time"
                    required={!t._delete}
                  />
                </div>

                <div className="col-md-3">
                  <input
                    name="max_time"
                    value={t.max_time}
                    onChange={(e) => handleThresholdChange(idx, e)}
                    className="form-control"
                    placeholder="Max Time"
                    required={!t._delete}
                  />
                </div>

                <div className="col-md-3">
                  <input
                    name="refund"
                    value={t.refund}
                    onChange={(e) => handleThresholdChange(idx, e)}
                    className="form-control"
                    placeholder="Refund %"
                    required={!t._delete}
                  />
                </div>

                <div className="col-md-3 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={addThresholdRow}
                  >
                    + Add
                  </button>

                  <button
                    type="button"
                    className={`btn ${t._delete ? "btn-warning" : "btn-danger"}`}
                    onClick={() => {
                      if (!t.id) removeThresholdRow(idx);
                      else markThresholdForDelete(idx);
                    }}
                  >
                    <Trash />
                  </button>
                </div>

                {t._delete && (
                  <div className="col-12">
                    <small className="text-danger">
                      This rule will be deleted.
                    </small>
                  </div>
                )}
              </div>
            ))}

            <div className="mt-3">
              <button type="submit" className="btn btn-primary">
                {editMode ? "Update Policy" : "Save Policy"}
              </button>
              <button
                type="button"
                className="btn btn-light ms-2"
                onClick={handleCloseForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POLICIES TABLE */}
      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Thresholds</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5">Loading...</td>
              </tr>
            )}

            {!loading && policies.length === 0 && (
              <tr>
                <td colSpan="5">No policies found.</td>
              </tr>
            )}

            {!loading &&
              policies.map((p) => (
                <tr key={p.policy_id}>
                  <td>{p.policy_id}</td>
                  <td>{p.name}</td>
                  <td>
                    {p.status === "Active" ? (
                      <span className="badge bg-success px-3 py-2 fs-6">Active</span>
                    ) : (
                      <span className="badge bg-danger px-3 py-2 fs-6">Inactive</span>
                    )}
                  </td>

                  <td style={{ textAlign: "left" }}>
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>Min</th>
                          <th>Max</th>
                          <th>Refund</th>
                        </tr>
                      </thead>

                      <tbody>
                        {thresholds
                          .filter((t) => t.policy_id === p.policy_id)
                          .map((t) => (
                            <tr key={t.id}>
                              <td>{t.min_time}</td>
                              <td>{t.max_time}</td>
                              <td>{t.refund}%</td>
                            </tr>
                          ))}

                        {thresholds.filter((t) => t.policy_id === p.policy_id).length ===
                          0 && (
                            <tr>
                              <td colSpan="3">No rules</td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </td>

                  <td>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => handleEdit(p)}
                    >
                      <PencilSquare /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(p.policy_id)}
                    >
                      <Trash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Cancellation;
