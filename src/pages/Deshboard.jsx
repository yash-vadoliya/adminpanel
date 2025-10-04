import React, { useEffect, useRef } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Chart from "chart.js/auto";

const cardsData = [
    { title: "Total Bookings", value: 0, icon: "bi-car-front-fill", bg: "#e8f0ff" },
    { title: "Booked Bookings", value: 0, icon: "bi-person-fill-add", bg: "#e0f7fa" },
    { title: "Missed Bookings", value: 0, icon: "bi-person-x-fill", bg: "#f5f5f5" },
    { title: "Active Bookings", value: 0, icon: "bi-calendar2-check-fill", bg: "#fff8e1" },
    { title: "Completed Bookings", value: 0, icon: "bi-check-circle-fill", bg: "#e8f5e9" },
    { title: "Cancelled Bookings", value: 0, icon: "bi-x-circle-fill", bg: "#ffebee" },
    { title: "Total Earning", value: 0, icon: "bi-currency-dollar", bg: "#e0f2f1" },
    { title: "New Users", value: 0, icon: "bi-person-fill", bg: "#e3f2fd" },
];

const Dashboard = () => {
    const lineCharts = useRef(null);
    const barCharts = useRef(null);

    const lineChartInstance = useRef(null);
    const barChartInstance = useRef(null);

    useEffect(() => {
        if (lineChartInstance.current) lineChartInstance.current.destroy();
        if (barChartInstance.current) barChartInstance.current.destroy();

        lineChartInstance.current = new Chart(lineCharts.current, {
            type: 'line',
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                    {
                        label: "Bookings",
                        data: [12, 19, 3, 5, 2, 3, 7],
                        borderColor: "#3e95cd",
                        backgroundColor: "rgba(62,149,205,0.2)",
                        tension: 0.4,
                        fill: true,
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: true } },
            },
        });

        barChartInstance.current = new Chart(barCharts.current, {
            type: 'bar',
            data: {
                labels: ["Total", "Booked", "Missed", "Active", "Completed", "Cancelled"],
                datasets: [
                    {
                        label: "Bookings",
                        data: cardsData.slice(0, 6).map(card => card.value),
                        backgroundColor: [
                            "#3e95cd",
                            "#8e5ea2",
                            "#3cba9f",
                            "#e8c3b9",
                            "#c45850",
                            "#ff6384",
                        ],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: { legend: { display: true } },
            },
        })
    }, []);

    return (
        <>
            <h2>Deshboard</h2>
            <div className="container-fluid mt-3">
                {/* Outer Card */}
                <div className="card shadow-lg border-0 p-3">
                    {/* Dropdown */}
                    <div className="mb-3">
                        <select className="form-select w-auto">
                            <option>Today</option>
                            <option>This Week</option>
                            <option>This Month</option>
                        </select>
                    </div>

                    {/* Cards Grid */}
                    <div className="row g-3">
                        {cardsData.map((card, index) => (
                            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={index}>
                                <div
                                    className="card shadow-sm border-0 h-100"
                                    style={{ backgroundColor: card.bg }}
                                >
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className={`bi ${card.icon} fs-3 me-2`} style={{ color: "#333" }}></i>
                                            <h6 className="card-title mb-0">{card.title}</h6>
                                        </div>
                                        <h4 className="fw-bold">{card.value}</h4>
                                        <div className="d-flex align-items-center text-success">
                                            <i className="bi bi-graph-up-arrow me-1"></i>
                                            <small>0%</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="container-fluid mt-3">
                <div className="row">
                    <div className="col-md-6">
                        <div className="card shadow-lg border-0 p-3">
                            <h5>Weekly Bookings</h5>
                            <canvas ref={lineCharts}></canvas>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card shadow-lg border-0 p-3">
                            <h5>Weekly Bookings</h5>
                            <canvas ref={barCharts}></canvas>
                        </div>
                    </div>
                </div>

            </div>
            <div className="container-fluid mt-3">
                <div className="card shadow-lg border-0 p-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">Booking Status</h4>
                        <div className="dropdown">
                            <button
                                className="btn btn-light dropdown-toggle"
                                type="button"
                                id="tripDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Trips
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="tripDropdown">
                                <li>
                                    <button className="dropdown-item">Completed Trips</button>
                                </li>
                                <li>
                                    <button className="dropdown-item">Ongoing Trips</button>
                                </li>
                                <li>
                                    <button className="dropdown-item">Cancelled Trips</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <hr />
                    <div className="d-flex align-items-center gap-2">
                        <label className="mb-0">From</label>
                        <input type="date" className="form-control w-auto" />

                        <label className="mb-0">To</label>
                        <input type="date" className="form-control w-auto" />
                    </div>

                    <canvas ref={barCharts}></canvas>
                </div>

            </div>

        </>

    );
};

export default Dashboard;
