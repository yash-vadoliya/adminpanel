import { useContext, useState } from "react";
import { AuthContext } from "../AuthContext";
import CONFIG from "../Config";

export default function useVehicles() {

    const { token } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/vehicles`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const result = await res.json();
            console.log("vehicle :", result[0]);
            setVehicles(result[0] || []);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        }
        setLoading(false);
    };

    return {
        vehicles,
        // loading,
        fetchVehicles
    };
}
