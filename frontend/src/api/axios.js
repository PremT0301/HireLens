import axios from "axios";

/**
 * Axios instance for SmartHire AI Frontend
 * Communicates ONLY with ASP.NET Core backend
 * Backend Port: 5033
 */

const api = axios.create({
    baseURL: "http://localhost:5033/api", // ✅ .NET Backend
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 15000 // 15s safety timeout
});

// ==============================
// REQUEST INTERCEPTOR
// Attach JWT token automatically
// ==============================
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");

        if (token) {
            console.log("🔑 [Axios] Attaching Token:", token.substring(0, 10) + "...");
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn("⚠️ [Axios] No token found in sessionStorage!");
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ==============================
// RESPONSE INTERCEPTOR
// Global auth / error handling
// ==============================
api.interceptors.response.use(
    (response) => response,

    (error) => {
        // Network error (server down, CORS, etc.)
        if (!error.response) {
            return Promise.reject({
                message: "Unable to connect to server"
            });
        }

        // Token expired / Unauthorized
        if (error.response.status === 401) {
            console.error("⛔ [Axios] 401 Unauthorized received. Keeping token for debug purposes.");
            // sessionStorage.removeItem("token");
            // sessionStorage.removeItem("userRole");
            // sessionStorage.removeItem("user");

            // Notify app immediately
            // window.dispatchEvent(new Event("storage"));
        }

        // Pass backend error forward
        return Promise.reject(error);
    }
);

export default api;
