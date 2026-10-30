import api from "../api/api";

const authService = {
    // LOGIN — POST /api/Auth/login
    async login(credentials, password, expectedRole) {
        let payload;
        if (typeof credentials === "object" && credentials !== null) {
            payload = { ...credentials };
            if (!expectedRole && credentials.role) {
                expectedRole = credentials.role;
            }
        } else {
            payload = { email: credentials, password, role: expectedRole };
        }

        if (expectedRole && !payload.role) {
            payload.role = expectedRole;
        }

        try {
            const response = await api.post("/Auth/login", payload);
            const result = response.data;

            if (!result?.success) {
                return {
                    success: false,
                    message: result?.message || "Login failed."
                };
            }

            const authData = result.data;
            const user = authData?.user;

            if (authData?.token) {
                localStorage.setItem("authToken", authData.token);
            }
            if (authData?.refreshToken) {
                localStorage.setItem("refreshToken", authData.refreshToken);
            }
            if (authData?.expiresAt) {
                localStorage.setItem("authExpiresAt", authData.expiresAt);
            }
            if (user) {
                localStorage.setItem("authUser", JSON.stringify(user));
            }

            return {
                success: true,
                data: authData,
                user: user
            };
        } catch (err) {
            console.error("Backend login error:", err);

            if (err.response && err.response.data && err.response.data.message) {
                return {
                    success: false,
                    message: err.response.data.message
                };
            }

            if (err.code === "ERR_NETWORK" || !err.response) {
                return {
                    success: false,
                    message: "Unable to connect to backend server. Please ensure the backend is running."
                };
            }

            return {
                success: false,
                message: err.message || "Login failed. Please check your credentials."
            };
        }
    },

    // REGISTER — POST /api/Auth/register
    async register(userData) {
        try {
            const response = await api.post("/Auth/register", userData);
            return response.data;
        } catch (err) {
            console.error("Backend registration error:", err);

            if (err.response && err.response.data && err.response.data.message) {
                return {
                    success: false,
                    message: err.response.data.message
                };
            }

            if (err.code === "ERR_NETWORK" || !err.response) {
                return {
                    success: false,
                    message: "Unable to connect to backend server. Please ensure the backend is running."
                };
            }

            return {
                success: false,
                message: err.message || "Registration failed."
            };
        }
    },

    // GET TOKEN
    getToken() {
        return localStorage.getItem("authToken");
    },

    // GET REFRESH TOKEN
    getRefreshToken() {
        return localStorage.getItem("refreshToken");
    },

    // GET CURRENT USER
    getCurrentUser() {
        const user = localStorage.getItem("authUser");
        if (!user) return null;
        try {
            return JSON.parse(user);
        } catch {
            localStorage.removeItem("authUser");
            return null;
        }
    },

    // GET TOKEN EXPIRY
    getTokenExpiry() {
        return localStorage.getItem("authExpiresAt");
    },

    // CHECK LOGIN
    isAuthenticated() {
        return !!localStorage.getItem("authToken");
    },

    // LOGOUT
    async logout() {
        const user = this.getCurrentUser();
        if (user?.id) {
            try {
                await api.post("/Auth/logout", { userId: Number(user.id) });
            } catch (e) {
                console.warn("Server logout notification skipped:", e);
            }
        }
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("authExpiresAt");
    }
};

export default authService;