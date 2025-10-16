// npm install axios dayjs
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

function Holiday() {
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month());
  const [holidays, setHolidays] = useState([]);
  const [dynamicHolidays, setDynamicHolidays] = useState([]);
  const [notes, setNotes] = useState({});
  const [days, setDays] = useState([]);

  // Load notes from localStorage
  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("notes") || "{}");
    setNotes(storedNotes);

    const storedDynamicHolidays = JSON.parse(
      localStorage.getItem("dynamicHolidays") || "[]"
    );
    setDynamicHolidays(storedDynamicHolidays);
  }, []);

  // Fetch static holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get(
          `https://jayantur13.github.io/calendar-bharat/calendar/${year}.json`
        );
        const monthKey = Object.keys(response.data)[month];
        const monthHolidaysObj = response.data[monthKey];
        const monthHolidaysArray = Object.keys(monthHolidaysObj).map((day) => ({
          date: `${year}-${(month + 1).toString().padStart(2, "0")}-${day
            .toString()
            .padStart(2, "0")}`,
          name: monthHolidaysObj[day],
        }));
        setHolidays(monthHolidaysArray);
      } catch (error) {
        console.error("Error fetching holidays:", error);
        setHolidays([]);
      }
    };
    fetchHolidays();
  }, [year, month]);

  // Generate calendar grid
  useEffect(() => {
    const daysInMonth = dayjs(`${year}-${month + 1}-01`).daysInMonth();
    const startDay = (dayjs(`${year}-${month + 1}-01`).day() + 6) % 7; // Monday start
    const grid = [];
    for (let i = 0; i < startDay; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) grid.push(d);
    setDays(grid);
  }, [year, month]);

  const handleNoteChange = (day, value) => {
    const key = `${year}-${month}-${day}`;
    const updated = { ...notes, [key]: value };
    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
  };

  // Toggle dynamic holiday
  const toggleHoliday = (day) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    let updated;
    if (dynamicHolidays.includes(dateStr)) {
      updated = dynamicHolidays.filter((d) => d !== dateStr);
    } else {
      updated = [...dynamicHolidays, dateStr];
    }
    setDynamicHolidays(updated);
    localStorage.setItem("dynamicHolidays", JSON.stringify(updated));
  };

  // Determine holiday name
  const getHolidayName = (day) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    const staticHoliday = holidays.find((h) => h.date === dateStr);
    if (staticHoliday) return staticHoliday.name;
    if (dynamicHolidays.includes(dateStr)) return "Bookings cannot be made today due to holiday.";
    return "";
  };

  // "This day is marked as a holiday. No bookings available."
  // "Bookings cannot be made today due to holiday."
  // "Holiday today – all bookings are paused."
  // "No reservations allowed today. Enjoy your holiday!"

  // Determine cell class
  const getDayClass = (day) => {
    if (!day) return "empty";

    const today = dayjs();
    const date = dayjs(`${year}-${month + 1}-${day}`);
    const isHoliday = Boolean(getHolidayName(day));
    const isSunday = date.day() === 0;
    const isToday = date.isSame(today, "day");
    const isPast = date.isBefore(today, "day");

    if (isToday) return "day-cell today";
    if (isHoliday || isSunday) return "day-cell holiday";
    if (isPast) return "day-cell past";
    return "day-cell";
  };

  const saveChanges = () => {
    alert("Changes saved successfully!");
  };

  return (
    <div className="container-fluid py-4">
      <h3 className="mb-4">Holiday List</h3>

      <div className="d-flex flex-wrap gap-3 mb-4">
        <select
          className="form-select w-auto"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          className="form-select w-auto"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="card p-4 shadow-sm">
        <h5 className="mb-3">
          Days in {dayjs(`${year}-${month + 1}-01`).format("MMMM YYYY")}
        </h5>

        <div className="grid-header mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="header-cell">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid fs-5">
          {days.map((d, i) => {
            if (!d) return <div key={i} className="empty"></div>;
            const holidayName = getHolidayName(d);
            const key = `${year}-${month}-${d}`;
            return (
              <div key={i} className={getDayClass(d)}>
                <div className="day-header d-flex justify-content-between align-items-center">
                  <strong>{d}</strong>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => toggleHoliday(d)}
                  >
                    Holiday
                  </button>
                </div>
                <small className="text-muted fs-5">
                  {dayjs(`${year}-${month + 1}-${d}`).format("dddd")}
                </small>

                {holidayName && (
                  <div className="text-danger small fw-bold mt-1">
                    {holidayName}
                  </div>
                )}

                <textarea
                  className="form-control form-control-sm mt-2"
                  rows={2}
                  placeholder="Note..."
                  value={notes[key] || ""}
                  onChange={(e) => handleNoteChange(d, e.target.value)}
                />
              </div>
            );
          })}
        </div>

        <div className="text-end mt-4">
          <button className="btn btn-primary px-4" onClick={saveChanges}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default Holiday;
