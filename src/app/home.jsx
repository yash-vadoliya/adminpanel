import React, { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../AuthContext";
import hero from "../images/bus.png";
import useCity from "../Hooks/useCities";
import useAll from "../Hooks/useAll";
import useVehicles from "../Hooks/useVehicles";
import useStops from "../Hooks/useStops";
import './Home.css';
import CONFIG from "../Config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useBooking from "../Hooks/useBooking";


function Home() {
  const { token, user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [journeyDate, setJourneyDate] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showSeat, setShowSeat] = useState(false);
  // const [activeTab, setActiveTab] = useState("select_seat");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showPickupDrop, setShowPickupDrop] = useState(false);
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [showCustDetails, setShowCustDetails] = useState(false);
  // const [showPayment, setShowPayment] = useState(false);
  const [passengers, setPassengers] = useState([]);
  const [activeTab, setActiveTab] = useState("route");
  const [paymentType, setPaymentType] = useState("");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [showPayment, setShowPayment] = useState(false);


  // hooks 
  const { city, fetchCity } = useCity();
  const { route, fetchRoutes, trips, fetchTrips, routestop, fetchRouteStop, thresholds, fetchThreshold, promo, fetchPromo, travel, fetchTravels } = useAll();
  const { vehicles, fetchVehicles } = useVehicles();
  const { stops, fetchStops } = useStops();
  const { booking, fetchBooking, saveBooking } = useBooking();

  // console.log("User Id  : ", user.user_id);

  const fetchData = async (route_id) => {
    try {
      setLoading(true);

      console.log("Route ID:", route_id);

      // const res = await fetch(`${CONFIG.API_BASE_URL}/route_stop/route/${route_id}`, {
      const res = await fetch(`${CONFIG.API_BASE_URL}/apphome/${route_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const mydata = await res.json();

      console.log("Data : ", mydata[0]);
      setData(mydata[0]);

    } catch (err) {
      console.error("Error Fetching Data: ", err);
    } finally {
      setLoading(false);
    }
  };

  const cleanedStops = useMemo(() => {
    if (!Array.isArray(data) || !stops.length) return [];

    // 1️⃣ only active rows
    const active = data.filter((i) => Number(i.record_status) === 1);

    // 2️⃣ keep BEST row per stop_id (lowest stop_order)
    const bestMap = new Map();

    active.forEach((item) => {
      const order = Number(item.stop_order);

      if (!bestMap.has(item.stop_id)) {
        bestMap.set(item.stop_id, item);
      } else {
        const existing = bestMap.get(item.stop_id);
        if (order < Number(existing.stop_order)) {
          bestMap.set(item.stop_id, item);
        }
      }
    });

    // 3️⃣ sort after dedupe
    const sorted = Array.from(bestMap.values()).sort(
      (a, b) => Number(a.stop_order) - Number(b.stop_order)
    );

    // 4️⃣ attach stop_name
    return sorted.map((item) => {
      const stop = stops.find((s) => s.stop_id == item.stop_id);
      return {
        ...item,
        stop_name: stop?.stop_name || "",
        city_id: stop?.city_id || "",
      };
    });
  }, [data, stops]);

  const pickupStops = useMemo(() => {
    if (!selectedTrip) return [];
    return cleanedStops.filter(
      (s) => s.city_id == selectedTrip.start_city_id
    );
  }, [cleanedStops, selectedTrip]);

  const dropStops = useMemo(() => {
    if (!selectedTrip) return [];
    return cleanedStops.filter(
      (s) => s.city_id == selectedTrip.end_city_id
    );
  }, [cleanedStops, selectedTrip]);

  useEffect(() => {
    fetchCity();
    fetchRoutes();
    fetchTrips();
    fetchBooking();
    fetchStops();
    fetchVehicles();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const handleSwap = () => { setFrom(to); setTo(from); };

  const handleToday = () => setJourneyDate(today);
  const handleTomorrow = () => setJourneyDate(tomorrow);

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };



  const seatSelector = (trip) => {
    const totalSeats = Number(trip.number_of_seats || 50);
    const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);



    return (
      <div className="bus-container">
        <div className="driver-section">
          <div className="steering-icon">⭕</div>
        </div>
        <div className="seats-grid">
          {/* Left Side (2 Seats) */}
          <div className="seat-column">
            {seats.filter(s => s % 5 === 1 || s % 5 === 2).map(s => (
              <div key={s} className={`seat ${selectedSeats.includes(s) ? "selected" : ""}`} onClick={() => toggleSeat(s)}>
                {s}
              </div>
            ))}
          </div>

          <div className="aisle-gap"></div>

          {/* Right Side (3 Seats) */}
          <div className="seat-column-triple">
            {seats.filter(s => s % 5 === 3 || s % 5 === 4 || s % 5 === 0).map(s => (
              <div key={s} className={`seat ${selectedSeats.includes(s) ? "selected" : ""}`} onClick={() => toggleSeat(s)}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);

    if (!from || !to || !journeyDate) {
      alert("Fill all fields");
      return;
    }

    if (!Array.isArray(city) || !Array.isArray(route) || !Array.isArray(trips) || !Array.isArray(vehicles)) {
      alert("Data not loaded yet. Please wait...");
      return;
    }

    // 🔥 smart city match (like old file)
    const from_city = city.find(c =>
      c.city_name.toLowerCase().includes(from.trim().toLowerCase())
    );

    const to_city = city.find(c =>
      c.city_name.toLowerCase().includes(to.trim().toLowerCase())
    );

    if (!from_city || !to_city) {
      alert("City not found");
      return;
    }

    // ✅ SAME AS OLD FILE (very important)
    const matchedRoutes = route.filter(r =>
      Number(r.record_status) === 1 &&
      Number(r.start_city_id) === Number(from_city.city_id) &&
      Number(r.end_city_id) === Number(to_city.city_id)
    );

    if (matchedRoutes.length === 0) {
      setResults([]);
      return;
    }

    // 🔥 route + trip (old logic)
    const routeTripData = trips
      .filter(t => matchedRoutes.some(r => Number(r.route_id) === Number(t.route_id)))
      .map(t => {
        const matchedRoute = matchedRoutes.find(
          r => Number(r.route_id) === Number(t.route_id)
        );
        return { ...matchedRoute, ...t };
      });

    // 🔥 + vehicle (old logic)
    const finalData = routeTripData.map(t => {
      const matchedVehicle = vehicles.find(
        v => Number(v.vehicles_id) === Number(t.vehicle_id)
      );

      return {
        ...t,
        ...(matchedVehicle || {})
      };
    });

    console.log("✅ FINAL DATA:", finalData);
    setResults(finalData);
  };

  const handleConfirmPayment = async () => {
    if (!paymentType) {
      alert("Please select payment method");
      return;
    }

    const booking_reference = "BK" + Date.now();

    const bookingPayload = {
      booking_reference,
      trip_id: selectedTrip.trip_id,
      created_by_user_id: user?.role_id <= 5 ? user.user_id : null,
      end_user_id: user?.role_id === 6 ? user.user_id : null,

      pickup_point: pickup,
      drop_point: drop,

      payment_type: paymentType,
      payment_status: "PAID",
      booking_status: "CONFIRMED",

      total_seats: selectedSeats.length,
      total_amount: totalAmount,
      travelling_date: journeyDate,

      seats: selectedSeats,
      passengers: passengers
    };

    const ok = await saveBooking(bookingPayload);

    if (ok) {
      alert("Booking Successful 🎉");

      const bookingDate = new Date().toISOString().split("T")[0];

      generatePDF({
        travel: travel?.[0] || {},
        selectedTrip,
        passengers,
        pickupStop: pickupStops.find(s => s.stop_id == pickup)?.stop_name || "",
        dropStop: dropStops.find(s => s.stop_id == drop)?.stop_name || "",
        totalAmount,
        paymentType,
        paymentStatus: "PAID",
        vehicleNumber: selectedTrip?.vehicles_number || "",
        bookingDate,
        tripDate: journeyDate,
        booking_reference,
        startCityName: startCity?.city_name || "",
        endCityName: endCity?.city_name || ""
      });



      setShowPayment(false);
      setSelectedSeats([]);
      setPassengers([]);
    }

  };
  const startCity = selectedTrip
    ? city.find(c => Number(c.city_id) === Number(selectedTrip.start_city_id))
    : null;

  const endCity = selectedTrip
    ? city.find(c => Number(c.city_id) === Number(selectedTrip.end_city_id))
    : null;


  const generatePDF = ({
    booking_reference,
    selectedTrip,
    passengers,
    pickupStop,
    dropStop,
    startCityName,
    endCityName,
    totalAmount,
    bookingDate,
    tripDate,
    paymentType,
    paymentStatus
  }) => {

    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();

    /* ================================
       PAGE 1 - TICKET DETAILS
    ================================= */

    // Header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LOGO Patel Travellers", 15, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${bookingDate}`, pageWidth - 50, 15);

    doc.line(15, 18, pageWidth - 15, 18);

    // Booking ID
    doc.setFontSize(11);
    doc.text(`Booking ID: ${booking_reference}`, pageWidth - 70, 28);

    /* From - To Section */
    doc.setFontSize(10);
    doc.text("From", 15, 40);
    doc.text("Boarding Point", 45, 40);
    doc.text("To", 105, 40);
    doc.text("Drop Point", 130, 40);

    doc.setFont("helvetica", "bold");
    doc.text(startCityName, 15, 47);
    doc.text(pickupStop, 45, 47);
    doc.text(endCityName, 105, 47);
    doc.text(dropStop, 130, 47);

    /* Vehicle Information */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Vehicle Information", pageWidth / 2, 65, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text("Vehicle Name", 15, 78);
    doc.text("Vehicle Type", 80, 78);
    doc.text("Vehicle Number", 150, 78);

    doc.setFont("helvetica", "bold");
    doc.text(selectedTrip.vehicles_name || "-", 15, 85);
    doc.text(selectedTrip.vehicles_type || "-", 80, 85);
    doc.text(selectedTrip.vehicles_number || "-", 150, 85);

    /* Trip Information */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Trip Information", pageWidth / 2, 105, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Trip Name", 15, 118);
    doc.text("Trip Date", 110, 118);

    doc.setFont("helvetica", "bold");
    doc.text(`${startCityName} to ${endCityName}`, 15, 125);
    doc.text(tripDate, 110, 125);

    /* Passenger Details */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Passenger Details", pageWidth / 2, 145, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text("SEAT NO", 20, 160);
    doc.text("NAME", 60, 160);
    doc.text("AGE", 120, 160);
    doc.text("GENDER", 150, 160);

    doc.line(15, 163, pageWidth - 15, 163);

    let y = 172;

    passengers.forEach(p => {
      doc.text(String(p.seat_no), 25, y);
      doc.text(p.name, 60, y);
      doc.text(String(p.age), 120, y);
      doc.text(p.gender, 150, y);
      y += 8;
    });

    /* Payment Details */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Payment Details", pageWidth / 2, y + 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text("Payment Method", 15, y + 28);
    doc.text("Payment Status", 110, y + 28);

    doc.setFont("helvetica", "bold");
    doc.text(paymentType, 15, y + 35);
    doc.text(paymentStatus, 110, y + 35);

    // Total Fare
    doc.setFontSize(14);
    doc.setTextColor(220, 0, 0);
    doc.text(`TOTAL FARE: ₹${totalAmount}`, pageWidth / 2, y + 50, { align: "center" });

    doc.setTextColor(0, 0, 0);

    // Footer
    doc.setFontSize(9);
    doc.text("Please carry valid ID Proof. Have a safe and pleasant journey!", pageWidth / 2, 285, { align: "center" });

    /* ================================
       PAGE 2 - POLICY
    ================================= */

    doc.addPage();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LOGO Patel Travellers", 15, 15);
    doc.text(`Date: ${bookingDate}`, pageWidth - 50, 15);

    doc.line(15, 18, pageWidth - 15, 18);

    /* Cancellation Policy */
    doc.setFontSize(12);
    doc.text("Cancellation Policy", 15, 35);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    let policyY = 45;

    const policies = [
      "Before 48 to 24 Hours: 90% Refund",
      "Before 24 to 12 Hours: 70% Refund",
      "Before 12 to 06 Hours: 50% Refund",
      "Before 06 Hours: 0% Refund",
      "",
      "Partial cancellation is allowed for this ticket",
      "Additional cancellation charges of Rs.15 per seat is applicable",
      "Refund Amount is indicative."
    ];

    policies.forEach(text => {
      doc.text(`• ${text}`, 20, policyY);
      policyY += 8;
    });

    /* Important Info */
    policyY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Important Information", 15, policyY);
    policyY += 10;

    doc.setFont("helvetica", "normal");

    const important = [
      "Please reach to pick up point at time",
      "In case Operator is not reachable please reach out to Customer Support"
    ];

    important.forEach(text => {
      doc.text(`• ${text}`, 20, policyY);
      policyY += 8;
    });

    /* Terms */
    policyY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions", 15, policyY);
    policyY += 10;

    doc.setFont("helvetica", "normal");

    const terms = [
      "Arrival and departure times are tentative.",
      "Passengers must arrive 15 mins before departure.",
      "Bus is not responsible for baggage loss.",
      "Cancellation charges applicable on original fare."
    ];

    terms.forEach(text => {
      doc.text(`• ${text}`, 20, policyY);
      policyY += 8;
    });

    doc.text("Please carry valid ID Proof. Have a safe and pleasant journey!", pageWidth / 2, 285, { align: "center" });

    doc.save("Bus_Ticket.pdf");
  };



  // ✅ Vehicle type detection
  const amenitiesFlags = useMemo(() => {
    const type = (selectedTrip?.vehicles_type || "").toLowerCase();

    return {
      hasAC: type.includes("ac"),
      isSleeper: type.includes("sleeper"),
      isSeater: type.includes("seater"),
      isElectric: type.includes("electric"),
    };
  }, [selectedTrip]);


  // ✅ Amenity reusable UI
  const Amenity = (icon, text) => (
    <div className="col-6 col-md-4">
      <div className="amenity-box">
        <i className={`bi ${icon}`}></i>
        <span>{text}</span>
      </div>
    </div>
  );

  const totalAmount =
    selectedSeats.length * (Number(selectedTrip?.trip_fare) || 0);


  return (
    <div className="home-wrapper">
      <div className="hero-section">
        <div className="container text-white">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="display-4 fw-bold">Ticket Booker</h1>
              <p className="lead">Reliable travel at your fingertips.</p>
            </div>
            <div className="col-md-6 text-center">
              <img src={hero} alt="bus" className="hero-img" />
            </div>
          </div>
        </div>
      </div>

      <div className="container search-container">
        <div className="card search-card shadow border-0">
          <form className="p-4" onSubmit={handleSearch}>
            <div className="row g-3 align-items-center">
              <div className="col-md">
                <input className="form-control rounded-pill" placeholder="From City" list="cityList" value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div className="col-md-1 text-center">
                <button type="button" className="btn btn-light rounded-circle shadow-sm" onClick={handleSwap}>⇄</button>
              </div>
              <div className="col-md">
                <input className="form-control rounded-pill" placeholder="To City" list="cityList" value={to} onChange={e => setTo(e.target.value)} />
              </div>
              <div className="col-md">
                <input type="date" className="form-control rounded-pill" min={today} value={journeyDate} onChange={e => setJourneyDate(e.target.value)} />
              </div>
              <div className="col-md-auto">
                <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={handleToday}>Today</button>
              </div>

              <div className="col-md-auto">
                <button type="button" className="btn btn-outline-danger rounded-pill" onClick={handleTomorrow}>Tomorrow</button>
              </div>
              <div className="col-md-2">
                <button className="btn btn-danger w-100 fw-bold">SEARCH</button>
              </div>
            </div>
            <datalist id="cityList">
              {city.map(c => <option key={c.city_id} value={c.city_name} />)}
            </datalist>
          </form>
        </div>
      </div>

      <div className="container mt-5">
        {results.map((t, i) => (
          <div key={i} className="card result-card mb-3 shadow-sm border-0">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <h4 className="mb-0">{t.trip_name}</h4>
                  <span className="badge bg-info text-dark">{t.vehicles_type}</span>
                </div>
                <div className="col-md-3">
                  <div className="text-muted">Departure</div>
                  <div className="fw-bold">{t.trip_time_from}</div>
                </div>
                <div className="col-md-2">
                  <div className="text-muted">Fare</div>
                  <div className="h5 text-danger mb-0">₹{t.trip_fare}</div>
                </div>
                <div className="col-md-3 text-end">

                  <button className="btn btn-success px-4" onClick={() => {
                    setSelectedTrip(t); setShowSeat(true); fetchData(t.route_id);
                    fetchTravels(t.travel_id); fetchThreshold(t.policy_id); fetchPromo(t.promotion_id);
                  }}>
                    Select Seats
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showSeat && (
        <div className="seat-overlay">
          <div className="seat-panel shadow-lg">
            <div className="panel-header p-3 border-bottom d-flex justify-content-between">
              <h4 className="mb-0">Select Seats</h4>
              <button className="btn-close" onClick={() => setShowSeat(false)}></button>
            </div>
            <div className="p-4">
              <div className="row">
                <div className="col-lg-6">
                  {seatSelector(selectedTrip)}
                </div>
                <div className="col-lg-6">
                  <div className="card vehicle-info-card border-0 shadow scrollable-vehicle">
                    <div className="card-body">
                      <h5>Vehicle Info</h5>
                      <hr />
                      <h6 className="fw-bold">{selectedTrip.vehicles_name}</h6>
                      <p className="text-muted mb-1">{selectedTrip.vehicles_number}</p>
                      <p className="mb-3">Total Seats: {selectedTrip.number_of_seats}</p>
                      <img src={selectedTrip.vehicle_image} className="img-fluid rounded" alt="bus" />

                      <hr />
                      <div class="scrollmenu">
                        <a className={`tab-item ${activeTab === "route" ? "active" : ""}`}
                          onClick={() => setActiveTab("route")}>Bus route</a>
                        <a className={`tab-item ${activeTab === "Pickup&Drop" ? "active" : ""}`}
                          onClick={() => setActiveTab("Pickup&Drop")} >Pickup & Drop</a>
                        <a className={`tab-item ${activeTab === "CancellationPolicy" ? "active" : ""}`}
                          onClick={() => setActiveTab("CancellationPolicy")}>Cancellation Policy</a>
                        <a className={`tab-item ${activeTab === "amenities" ? "active" : ""}`}
                          onClick={() => setActiveTab("amenities")}>Amenities</a>
                        <a className={`tab-item ${activeTab === "Promo" ? "active" : ""}`}
                          onClick={() => setActiveTab("Promo")}>Promo</a>
                      </div>

                      {/* Route Show Section */}
                      <div className="card shadow route-scroll-card mt-3">

                        <div className="card-body">
                          {activeTab === 'route' && (
                            <>
                              <h5 className="card-title mb-3">Bus Route</h5>
                              <div className="route-line">
                                {cleanedStops
                                  .filter((stop) => stop.record_status === 1)
                                  .map((stop, index) => (
                                    // <span key={index} className="route-stop">
                                    <span key={stop.stop_id} className="route-stop">
                                      {stop.stop_name}
                                      {index !== cleanedStops.length - 1 && (
                                        <span className="route-arrow">➤</span>
                                      )}
                                    </span>
                                  ))}
                              </div>
                            </>
                          )}

                          {/* Bus Pikup And Drop Section */}
                          {activeTab === 'Pickup&Drop' && (
                            <>
                              <h5 className="card-title">Bus Pickup and Drop Points</h5>

                              <div className="row mt-3">
                                <div className="col-md-6">
                                  <h6 className="section-title">Pickup Points</h6>
                                  <div className="timeline">
                                    {pickupStops.map((item) => (
                                      <div key={`pickup-${item.stop_id}`} className="timeline-row">
                                        <div className="dot"></div>
                                        <div className="text">{item.stop_name}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <h6 className="section-title">Drop Points</h6>
                                  <div className="timeline">
                                    {dropStops.map((item) => (
                                      <div key={`drop-${item.stop_id}`} className="timeline-row">
                                        <div className="dot"></div>
                                        <div className="text">{item.stop_name}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Bus Policy and There rules */}
                          {activeTab === 'CancellationPolicy' && (
                            <>
                              <h5 className="card-title mb-3">Cancellation Policy</h5>
                              <div class="table-responsive rounded-3 shadow-sm border overflow-hidden">
                                <table class="table table-bordered table-hover mb-0">
                                  <thead class="table-info text-center">
                                    <tr>
                                      <th>Time before travel</th>
                                      <th style={{ width: "60px" }}>Deduction</th>
                                    </tr>
                                  </thead>
                                  <tbody className="text-center">
                                    {thresholds.map((d, i) => (
                                      <tr key={i}>
                                        <td>From {d.min_time} - To {d.max_time}</td>
                                        <td>{d.refund} %</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          )}

                          {activeTab === 'amenities' && (
                            <div className="card-body">
                              <h5 className="card-title mb-3">Amenities</h5>

                              <div className="row g-3">
                                {amenitiesFlags.hasAC && Amenity("bi-snow", "AC")}
                                {amenitiesFlags.isSleeper && Amenity("bi-moon", "Sleeper")}
                                {amenitiesFlags.isSeater && Amenity("bi-person", "Seater")}
                                {amenitiesFlags.isElectric && Amenity("bi-battery-charging", "Electric")}

                                {Amenity("bi-plug-fill", "Charging Point")}
                                {Amenity("bi-lightbulb-fill", "Reading Light")}
                              </div>
                            </div>
                          )}

                          {activeTab === 'Promo' && (
                            <div className="card shadow-sm border-0">
                              <div className="card-body">
                                <h5 className="card-title mb-4">Available Promotions</h5>

                                {promo.length === 0 && (
                                  <div className="text-muted">No promotions available</div>
                                )}

                                {promo.map((p) => (
                                  <div key={p.promotion_id} className="promo-card mb-3">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <h6 className="fw-bold mb-1">{p.promotion_title}</h6>
                                        <div className="text-muted small">
                                          <i className="bi bi-calendar-event me-1"></i>
                                          {new Date(p.start_date).toLocaleDateString()} -
                                          {new Date(p.end_date).toLocaleDateString()}
                                        </div>
                                      </div>

                                      <div className="discount-badge">
                                        {p.discount_value} OFF
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}


                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md">
                  <div className="mt-4">
                    {selectedSeats.length > 0 && (
                      <button
                        className="btn btn-primary w-100 py-2 fs-5"
                        onClick={() => {
                          const initialPassengers = selectedSeats.map((seatNo) => ({
                            seat_no: seatNo,
                            name: "",
                            gender: "",
                            age: ""
                          }));

                          setPassengers(initialPassengers);
                          fetchRouteStop(selectedTrip.route_id);
                          setShowPickupDrop(true);
                          setShowSeat(false);
                        }}>
                        Continue to Book ({selectedSeats.length})
                      </button>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPickupDrop && (
        <div className="seat-overlay">
          <div className="seat-panel shadow-lg">
            <div className="panel-header p-3 border-bottom d-flex justify-content-between">
              <h4 className="mb-0">Select Pickup & Drop Point</h4>
              <button className="btn-close" onClick={() => setShowPickupDrop(false)}></button>
            </div>
            <div className="p-4">
              <div className="row">
                <div className="col-lg-6">
                  <label className="form-label">Pickup Point</label>
                  <select
                    className="form-select"
                    value={pickup}
                    onChange={(e) => {
                      setPickup(e.target.value);
                      setDrop(""); // reset drop when pickup changes
                    }}
                  >
                    <option value="">Select Pickup</option>

                    {/* {pickupStops.map((item) => {
                      const stop = stops.find(
                        (s) => String(s.stop_id) === String(item.stop_id)
                      );

                      return (
                        <option key={item.stop_id} value={item.stop_id}>
                          {stop?.stop_name}
                        </option>
                      );
                    })} */}
                    {pickupStops.map((item) => (
                      <option
                        // key={`pickup-${item.stop_sequence}`}
                        key={`pickup-${item.stop_id}`}

                        value={item.stop_id}
                      >
                        {item.stop_name}
                      </option>
                    ))}


                  </select>

                </div>
                <div className="col-lg-6">
                  <label className="form-label">Drop Point</label>
                  <select
                    className="form-select"
                    value={drop}
                    onChange={(e) => setDrop(e.target.value)}
                    disabled={!pickup}
                  >
                    <option value="">Select Drop</option>
                    {dropStops.map((item) => (
                      <option
                        // key={`drop-${item.stop_sequence}`}
                        key={`drop-${item.stop_id}`}

                        value={item.stop_id}
                      >
                        {item.stop_name}
                      </option>
                    ))}


                  </select>

                </div>
              </div>
              <div className="row">
                <div className="col-md">
                  <div className="mt-4">
                    {pickup && drop && (
                      <button className="btn btn-success w-100 mt-4" onClick={() => {
                        setShowPickupDrop(false);
                        setShowCustDetails(true);
                      }}>
                        Confirm Pickup and Drop
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCustDetails && (
        <div className="seat-overlay">
          <div className="seat-panel shadow-lg">
            <div className="panel-header p-3 border-bottom d-flex justify-content-between">
              <h4 className="mb-0">Enter Pacenger Details</h4>
              <button className="btn-close" onClick={() => setShowCustDetails(false)}></button>
            </div>
            <div className="p-4">
              <div className="row">
                {passengers.map((p, index) => (
                  <div key={index} className="card mb-3 p-3">
                    <h6>Passenger for Seat {p.seat_no}</h6>

                    <label>Name</label>
                    <input
                      className="form-control"
                      value={p.name}
                      onChange={(e) => {
                        const updated = [...passengers];
                        updated[index].name = e.target.value;
                        setPassengers(updated);
                      }}
                    />

                    <label>Gender</label>
                    <select
                      className="form-select"
                      value={p.gender}
                      onChange={(e) => {
                        const updated = [...passengers];
                        updated[index].gender = e.target.value;
                        setPassengers(updated);
                      }}
                    >
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>

                    <label>Age</label>
                    <input
                      className="form-control"
                      type="number"
                      value={p.age}
                      onChange={(e) => {
                        const updated = [...passengers];
                        updated[index].age = e.target.value;
                        setPassengers(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="row">
                <div className="col-md">
                  <div className="mt-4">
                    <button className="btn btn-success w-100 mt-4" onClick={() => {
                      setShowCustDetails(false);
                      setShowPayment(true);
                    }}>
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPayment && (
        <div className="seat-overlay">
          <div className="seat-panel shadow-lg">
            <div className="panel-header p-3 border-bottom d-flex justify-content-between">
              <h4 className="mb-0">Payment Details</h4>
              <button
                className="btn-close"
                onClick={() => setShowPayment(false)}
              ></button>
            </div>

            <div className="p-4">
              <div className="card p-3 mb-3">

                {/* Total Amount */}
                <h5 className="mb-3">Total Amount: ₹{totalAmount}</h5>

                {/* Payment Type */}
                <label className="form-label">Select Payment Method</label>
                <select
                  className="form-select mb-3"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="ONLINE">Online</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                </select>

                {/* UPI ID (only if UPI selected) */}
                {paymentType === "UPI" && (
                  <>
                    <label className="form-label">Enter UPI ID</label>
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="example@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </>
                )}

                {/* Card Details (only if Card selected) */}
                {paymentType === "CARD" && (
                  <>
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />

                    <div className="row">
                      <div className="col">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                        />
                      </div>
                      <div className="col">
                        <input
                          type="password"
                          className="form-control"
                          placeholder="CVV"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4">
                <button
                  className="btn btn-success w-100"
                  onClick={handleConfirmPayment}
                >
                  Pay & Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}

export default Home;