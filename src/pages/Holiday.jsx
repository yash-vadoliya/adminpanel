// npm install react-calendar axios
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "../App.css";
import "react-calendar/dist/Calendar.css";
// import "./styles.css"; // For holiday red highlight

function CalendarWithHolidays() {
  const [date, setDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]); // Array of holiday objects
  const [notes, setNotes] = useState({});

  // Load notes from localStorage
  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("notes") || "{}");
    setNotes(storedNotes);
  }, []);

  // Fetch holidays for the selected year
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year = date.getFullYear();
        const response = await axios.get(
          `https://jayantur13.github.io/calendar-bharat/calendar/${year}.json`
        );

        // Convert month data into array of holiday objects
        const monthIndex = date.getMonth(); // 0 = Jan
        const monthKey = Object.keys(response.data)[monthIndex];
        const monthHolidaysObj = response.data[monthKey];

        // Convert monthHolidaysObj to array
        const monthHolidaysArray = Object.keys(monthHolidaysObj).map((day) => ({
          date: `${year}-${(monthIndex + 1).toString().padStart(2, "0")}-${day
            .toString()
            .padStart(2, "0")}`,
          name: monthHolidaysObj[day],
        }));

        setHolidays(monthHolidaysArray);
      } catch (error) {
        console.error("Error fetching holiday data:", error);
        setHolidays([]);
      }
    };

    fetchHolidays();
  }, [date]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleNoteChange = (e, day) => {
    const updated = { ...notes, [day]: e.target.value };
    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
  };

  const getHolidayName = (day) => {
    const dayStr = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    const holiday = holidays.find((h) => h.date === dayStr);
    return holiday ? holiday.name : "";
  };

  const tileClassName = ({ date: tileDate }) => {
    const holidayName = getHolidayName(tileDate.getDate());
    return holidayName ? "highlight-holiday" : "";
  };

  return (
    <div className="container mt-3">
      <h1>Calendar with Holidays</h1>
      <Calendar onChange={handleDateChange} value={date} tileClassName={tileClassName} />

      <div className="mt-3">
        <h2>Notes for {date.toDateString()}</h2>
        <textarea
          className="form-control"
          value={notes[date.getDate()] || ""}
          onChange={(e) => handleNoteChange(e, date.getDate())}
          placeholder="Write your note here"
        />
      </div>
    </div>
  );
}

export default CalendarWithHolidays;
