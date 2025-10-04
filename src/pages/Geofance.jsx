import React, {useState} from 'react'
import WorldMap from '../components/WorldMap'

const Geofance = () => {
    const [mapType, setMapType] = useState("roadmap")
    return (
        <>
            <h2>Geofance</h2>
            <div className="container-fluid mt-3">
                <div className='card shadow-lg border-0 p-3 vh-100'>
                    <div className="mb-3">
                        <button className={`btn me-2 ${mapType === "roadmap" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMapType("roadmap")}>Roadmap </button>
                        <button className={`btn ${mapType === "satellite" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setMapType("satellite")}>Satellite</button>
                    </div>
                    <div className="card shadow-lg border-0 p-3 vh-100">
                        <WorldMap
                            center={[20.5937, 78.9629]}
                            zoom={5}
                            mapType={mapType}
                        // markers={markers}
                        />
                    </div>
                </div>
            </div>
        </>

    )
}

export default Geofance
