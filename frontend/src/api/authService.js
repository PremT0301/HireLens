import api from "./axios";
import { jwtDecode } from "jwt-decode";

const ROLE_CLAIM =
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const AuthService = {

    // ======================
    // LOGIN
    // ======================
    login: async (email, password) => {
        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            const { token, role } = response.data;

            if (!token) {
                throw new Error("Token not returned from API");
            }

            // Store token
            console.log("🔒 [Login] Storing Token:", token.substring(0, 10) + "...");
            sessionStorage.setItem("token", token);
            console.log("🔒 [Login] Token Stored in SessionStorage");

            // Decode JWT
            let decoded;
            try {
                decoded = jwtDecode(token);
            } catch (err) {
                console.error("JWT decode failed", err);
                throw new Error("Invalid token");
            }

            // Resolve role (ASP.NET compatible)
            const resolvedRole =
                role ||
                decoded.role ||
                decoded[ROLE_CLAIM] ||
                "applicant";

            // Persist user info
            sessionStorage.setItem("userRole", resolvedRole.toLowerCase());
            sessionStorage.setItem(
                "user",
                JSON.stringify({
                    email: decoded.sub,
                    role: resolvedRole
                })
            );

            // Notify app about auth change
            window.dispatchEvent(new Event("storage"));

            return response.data;

        } catch (error) {
            console.error("Login failed", error);

            throw error.response?.data || {
                message: "Unable to connect to server"
            };
        }
    },

    // ======================
    // REGISTER
    // ======================
    register: async (userData) => {
        try {
            // userData can be JSON or FormData
            // If it's FormData, axios sets Content-Type to multipart/form-data automatically
            const response = await api.post("/auth/register", userData);
            return response.data;

        } catch (error) {
            console.error("Registration failed", error);

            throw error.response?.data || {
                message: "Unable to connect to server"
            };
        }
    },

    // ======================
    // LOGOUT
    // ======================
    logout: () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("user");

        window.dispatchEvent(new Event("storage"));

        // Hard redirect to clear memory state
        window.location.replace("/");
    },

    // ======================
    // GET CURRENT USER
    // ======================
    getCurrentUser: () => {
        const userStr = sessionStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },

    // ======================
    // AUTH CHECK
    // ======================
    isAuthenticated: () => {
        return Boolean(sessionStorage.getItem("token"));
    }
};

export default AuthService;
