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
                    role: resolvedRole,
                    plan: decoded.PricingPlan || "FREE"
                })
            );


            // Notify app about auth change
            window.dispatchEvent(new Event("storage"));

            return response.data;

        } catch (error) {
            console.error("Login failed", error);

            let message = "Unable to connect to server";
            const serverError = error.response?.data;

            if (serverError) {
                if (typeof serverError === "string") {
                    message = serverError;
                } else if (serverError.message) {
                    message = serverError.message;
                } else if (serverError.errors) {
                    // ASP.NET Core Validation Errors
                    const firstKey = Object.keys(serverError.errors)[0];
                    const firstError = serverError.errors[firstKey];
                    message = Array.isArray(firstError) ? firstError[0] : firstError;
                } else if (serverError.title) {
                    message = serverError.title;
                }
            } else if (error.message) {
                message = error.message;
            }

            throw { message };
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

            let message = "Unable to connect to server";
            const serverError = error.response?.data;

            if (serverError) {
                if (typeof serverError === "string") {
                    message = serverError;
                } else if (serverError.message) {
                    message = serverError.message;
                } else if (serverError.errors) {
                    const firstKey = Object.keys(serverError.errors)[0];
                    const firstError = serverError.errors[firstKey];
                    message = Array.isArray(firstError) ? firstError[0] : firstError;
                } else if (serverError.title) {
                    message = serverError.title;
                }
            } else if (error.message) {
                message = error.message;
            }

            throw { message };
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
    },

    // ======================
    // UPGRADE PLAN
    // ======================
    upgradePlan: async (plan) => {
        try {
            const response = await api.post("/subscriptions/upgrade", { plan });

            // If server returns updated plan, sync local storage
            if (response.data && response.data.plan) {
                AuthService.updateLocalPlan(response.data.plan);
            }

            return response.data;
        } catch (error) {
            console.error("Upgrade failed", error);
            throw error;
        }
    },

    // ======================
    // SYNC LOCAL STATE
    // ======================
    updateLocalPlan: (newPlan) => {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            user.plan = newPlan;
            sessionStorage.setItem("user", JSON.stringify(user));

            // Notify app about state change
            window.dispatchEvent(new Event("storage"));
        }
    }
};

export default AuthService;
