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

            sessionStorage.setItem("userRole", resolvedRole.toLowerCase());
            sessionStorage.setItem(
                "user",
                JSON.stringify({
                    email: decoded.sub || decoded.email,
                    fullName: decoded.FullName || decoded.fullName,
                    role: resolvedRole,
                    plan: decoded.subscriptionPlan || decoded.PricingPlan || "FREE"
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
            const response = await api.post("/subscription/upgrade", { plan });

            if (response.data) {
                // Store the fresh JWT if the backend re-issued one (PricingPlan claim is updated)
                if (response.data.token) {
                    sessionStorage.setItem("token", response.data.token);
                }
                // Sync the plan in the local user object
                if (response.data.plan) {
                    AuthService.updateLocalPlan(response.data.plan);
                }
            }

            return response.data;
        } catch (error) {
            console.error("Upgrade failed", error);
            throw error;
        }
    },

    downgradePlan: async (plan) => {
        try {
            const response = await api.post("/subscription/downgrade", { plan });

            if (response.data && response.data.plan) {
                AuthService.updateLocalPlan(response.data.plan);
            }

            return response.data;
        } catch (error) {
            console.error("Downgrade failed", error);
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
    },

    // ======================
    // OTP VERIFICATION
    // ======================
    sendEmailOtp: async (email) => {
        const response = await api.post(`/auth/send-email-otp?email=${email}`);
        return response.data;
    },

    verifyEmailOtp: async (email, otp) => {
        const response = await api.post("/auth/verify-email-otp", { identifier: email, otp });
        return response.data;
    },

    // ======================
    // FORGOT PASSWORD
    // ======================
    forgotPassword: async (email) => {
        try {
            const response = await api.post("/auth/forgot-password", { email });
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Unable to connect to server";
            throw { message: msg };
        }
    },

    verifyResetOtp: async (email, otp) => {
        try {
            const response = await api.post("/auth/verify-reset-otp", { email, otp });
            return response.data; // { resetToken, message }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Invalid code";
            const status = error.response?.status;
            throw { message: msg, status };
        }
    },

    resetPassword: async (resetToken, newPassword, confirmPassword) => {
        try {
            // Use the reset token as Bearer, NOT the session auth token
            const response = await api.post(
                "/auth/reset-password",
                { newPassword, confirmPassword },
                { headers: { Authorization: `Bearer ${resetToken}` } }
            );
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Reset failed";
            throw { message: msg };
        }
    }
};

export default AuthService;
