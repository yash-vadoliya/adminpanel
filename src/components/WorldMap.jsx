import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const defultIcon = new L.Icon({
     iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="red" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
      </svg>
    `),
    // iconUrl : "https://www.flaticon.com/free-icon/placeholder_684908",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]

})

const WorldMap = ({ center = [20.5937, 78.9629], zoom = 5, markers = [], mapType = "roadmap" }) => {
    return (
        <div>
            <MapContainer center={center} zoom={zoom} style={{ height: "80vh", width: "100%" }}>
                {/* Choose tile layer based on mapType */}
                {mapType === "roadmap" ? (
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                ) : (
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="Tiles &copy; Esri &mdash; Source: Esri, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, and the GIS User Community"
                    />
                )}

                {/* Render markers */}
                {markers.map((marker, idx) => (
                    <Marker
                        key={idx}
                        position={marker.position}
                        icon={defultIcon}
                    >
                        {marker.popup && <Popup>{marker.popup}</Popup>}
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}

export default WorldMap
