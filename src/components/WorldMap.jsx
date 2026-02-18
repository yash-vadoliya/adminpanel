import React, { useMemo, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Default Marker Icon
const defaultIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="red" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
      </svg>
    `),
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// ✅ Component to handle dynamic resizing safely
function MapAutoResize() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);

  return null;
}

// ✅ Main WorldMap Component
const WorldMap = ({
  center = [20.5937, 78.9629],
  zoom = 5,
  markers = [],
  mapType = "roadmap",
}) => {
  const mapRef = useRef();

  // 🧠 Ensure valid markers only
  const validMarkers = useMemo(() => {
    return markers
      .map((m) => {
        if (m.position && Array.isArray(m.position)) {
          const [lat, lng] = m.position;
          return { lat: +lat, lng: +lng, name: m.name };
        } else if (m.lat && m.lng) {
          return { lat: +m.lat, lng: +m.lng, name: m.name };
        }
        return null;
      })
      .filter((m) => m && !isNaN(m.lat) && !isNaN(m.lng));
  }, [markers]);

  return (
    <div
      className="map-container"
      style={{ height: "90vh", width: "100%", borderRadius: "10px", overflow: "hidden" }}
    >
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <MapAutoResize />

        {mapType === "roadmap" ? (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri — Source: Esri, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, and the GIS User Community"
          />
        )}

        {validMarkers.map((marker, idx) => (
          <Marker key={idx} position={[marker.lat, marker.lng]} icon={defaultIcon}>
            {marker.name && <Popup>{marker.name}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorldMap;
