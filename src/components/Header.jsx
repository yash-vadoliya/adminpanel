import React, { useContext, useEffect, useState } from "react";
import Image from "../user.jpg";
import DefultLogo from "../defultLogo.jpg";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";

const Header = () => {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  const [userdata, setUserdata] = useState(null);
  const [traveldata, setTraveldata] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin");
  };

  // ==============================================
  // FAST & CLEAN USER FETCH
  // ==============================================
  const fetchUser = async () => {
    if (!user?.user_id) return;

    // console.log("Fetching user:", user.user_id);

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/user/${user.user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      // console.log("User Response:", data);

      // Extract clean MySQL user row
      const userData =
        Array.isArray(data) &&
          Array.isArray(data[0]) &&
          data[0].length > 0
          ? data[0][0]
          : null;

      setUserdata(userData);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  // ==============================================
  // TRAVEL FETCH (Uses userdata.travel_id)
  // ==============================================
  const fetchTravel = async () => {
    if (!userdata?.travel_id) return;

    // console.log("Fetching travel:", userdata.travel_id);

    try {
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/travel/${userdata.travel_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      // console.log("Travel Response:", data);

      // Extract clean MySQL travel row
      const travelInfo =
        Array.isArray(data) &&
          Array.isArray(data[0]) &&
          data[0].length > 0
          ? data[0][0]
          : null;

      setTraveldata(travelInfo);
    } catch (err) {
      console.error("Error fetching travel:", err);
    }
  };

  // Run when user_id changes
  useEffect(() => {
    fetchUser();
  }, [user?.user_id]);

  // Run after user details loaded
  useEffect(() => {
    if (userdata?.travel_id) {
      fetchTravel();
    }
  }, [userdata]);

  return (
    <header className="d-flex flex-wrap justify-content-between align-items-center py-2 border-bottom px-4 bg-light shadow-sm">
      <a href="/admin" className="d-flex align-items-center text-dark text-decoration-none">

        <img src={traveldata?.logo || DefultLogo} alt="logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
        <span className="fs-2 fw-bold ps-3">
          {traveldata?.name || "Super Admin Panel"}
        </span>
      </a>

      <div className="d-flex align-items-center gap-3">
        <div className="text-end">
          <strong className="d-block">
            {userdata?.user_name || "Loading..."}
          </strong>

          <small className="text-muted">
            {userdata?.user_role || ""}
          </small>

          {/* {traveldata?.travel_name && (
            <div>
              <small className="text-success fw-bold">
                {traveldata.name}
              </small>
            </div>
          )} */}
        </div>

        {/* User Image */}
        <img
          src={Image}
          alt="User"
          style={{ width: "45px", height: "45px", borderRadius: "50%" }}
        />

        {/* Logout Button */}
        <button className="btn btn-outline-dark btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
