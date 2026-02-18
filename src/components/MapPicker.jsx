// import React, { useEffect } from "react";
// import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// import L from "leaflet";

// // Optional custom marker icon fix for React-Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// const LocationMarker = ({ position, setPosition }) => {
//   useMapEvents({
//     click(e) {
//       setPosition(e.latlng);
//     },
//   });

//   return position === null ? null : (
//     <Marker
//       position={position}
//       draggable={true}
//       eventHandlers={{
//         dragend: (e) => setPosition(e.target.getLatLng()),
//       }}
//     />
//   );
// };

// const MapPicker = ({ latitude, longitude, onLocationChange }) => {
//   const [position, setPosition] = React.useState(
//     latitude && longitude ? { lat: latitude, lng: longitude } : null
//   );

//   useEffect(() => {
//     if (position) onLocationChange(position.lat, position.lng);
//   }, [position, onLocationChange]);

//   return (
//     <div style={{ height: "400px", width: "100%", borderRadius: "10px", overflow: "hidden" }}>
//       <MapContainer
//         center={position || { lat: 22.3039, lng: 70.8022 }} // Default: Rajkot
//         zoom={13}
//         style={{ height: "100%", width: "100%" }}
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         <LocationMarker position={position} setPosition={setPosition} />
//       </MapContainer>
//     </div>
//   );
// };

// export default MapPicker;

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🧭 Fix for missing default marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapPicker = ({ latitude, longitude, onLocationChange }) => {
  const [position, setPosition] = useState({
    lat: latitude || 0,
    lng: longitude || 0,
  });

  useEffect(() => {
    // update position if props change
    if (latitude && longitude) {
      setPosition({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        if (onLocationChange) onLocationChange({ lat, lng });
      },
    });

    // 🟢 Show the marker when position is set
    return position.lat !== 0 ? <Marker position={position}></Marker> : null;
  }

  return (
    <MapContainer
      center={[latitude || 20.5937, longitude || 78.9629]} // default: India center
      zoom={latitude && longitude ? 13 : 5}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
};

export default MapPicker;

