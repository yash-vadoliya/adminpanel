import React, { useContext, useState } from 'react'
import { AuthContext } from '../AuthContext'
import CONFIG from '../Config';

function useCustomer
  () {
  const { token, user } = useContext(AuthContext);
  const [customer, setcustomer] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_BASE_URL}/customer`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const mydata = await res.json();
      console.log("Data : ", mydata[0]);
      setcustomer(mydata[0]);

    } catch (err) {
      console.error("Error Fetching Data: ", err);
    } finally {
      setLoading(false);
    }
  };

  const saveCustomer = async (customerData, editId = null) => {
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${CONFIG.API_BASE_URL}/customer/${editId}`
      : `${CONFIG.API_BASE_URL}/customer`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const payload = {
      ...customerData,
    }
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (res.ok) {
        fetchcustomer();
        return true;
      } else {
        console.error("Save failed:", await res.text());
        return false;
      }
    } catch (err) {
      console.error("Error saving city:", err);
      return false;
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return false;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/customer/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchcustomer();
        return true;
      } else {
        console.error("Delete failed:", await res.text());
        return false;
      }
    } catch (err) {
      console.error("Error deleting city:", err);
      return false;
    }
  };
  return { customer, fetchCustomer, saveCustomer, deleteCustomer, loading }
}

export default useCustomer
