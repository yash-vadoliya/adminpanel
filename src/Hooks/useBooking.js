import React, { useContext, useState } from 'react'
import { AuthContext } from '../AuthContext'
import CONFIG from '../Config';

function useBooking() {
  const { token, user } = useContext(AuthContext);
  const [booking, setBooking] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CONFIG.API_BASE_URL}/booking`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const mydata = await res.json();
      console.log("Data : ", mydata[0]);
      setBooking(mydata[0]);

    } catch (err) {
      console.error("Error Fetching Data: ", err);
    } finally {
      setLoading(false);
    }
  };

  const saveBooking = async (bookingData, editId = null) => {
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${CONFIG.API_BASE_URL}/booking/${editId}`
      : `${CONFIG.API_BASE_URL}/booking`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const payload = {
      ...bookingData,
    }
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (res.ok) {
        fetchBooking();
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

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Booking?")) return false;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/booking/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchBooking();
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
  return { booking, fetchBooking, saveBooking, deleteBooking, loading }
}

export default useBooking