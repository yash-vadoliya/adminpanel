import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../AuthContext'
import CONFIG from '../Config';

function Features() {
  const { token } = useContext(AuthContext);

  const [data, setData] = useState(null);   // ✅ object
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const route_id = 240001;
      console.log(route_id);
      const res = await fetch(`${CONFIG.API_BASE_URL}/apphome/${route_id}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      console.log("Data:", result);

      setData(result[0]); // backend returning array
    } catch (err) {
      console.error("Data error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Features</h3>

      {loading && <p>Loading...</p>}

      {!loading && !data && <p>No data found</p>}

      {!loading && data && (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  )
}

export default Features;
