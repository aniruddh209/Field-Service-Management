import api from "../api/api";

const authService = {
    // LOGIN — Strictly connects to ASP.NET Core Backend API
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
            const authData = result?.data || result;
            const user = authData?.user;

            // Enforce Portal Role Validation
            if (user && expectedRole) {
                const userRole = user.role;
                const isManagementMatch = (expectedRole === "Owner" || expectedRole === "Manager") &&
                                          (userRole === "Owner" || userRole === "Manager");

                if (userRole !== expectedRole && !isManagementMatch) {
                    this.logout();
                    return {
                        success: false,
                        message: `Access denied: Account '${payload.email}' is registered as '${userRole}', but you selected the '${expectedRole}' portal. Please select the '${userRole}' portal tab to sign in.`
                    };
                }
            }

            if (authData?.token) {
                localStorage.setItem("authToken", authData.token);
            }
            if (authData?.expiresAt) {
                localStorage.setItem("authExpiresAt", authData.expiresAt);
            }
            if (authData?.user) {
                localStorage.setItem("authUser", JSON.stringify(authData.user));
            }

            return result;
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
                    message: "Unable to connect to ASP.NET Core backend server at http://localhost:5179/api. Please ensure the backend is running via 'dotnet run'."
                };
            }

            return {
                success: false,
                message: err.message || "Login failed. Please check your credentials."
            };
        }
    },

    // REGISTER — Strictly connects to ASP.NET Core Backend API
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
                    message: "Unable to connect to ASP.NET Core backend server at http://localhost:5179/api. Please ensure the backend is running via 'dotnet run'."
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
    logout() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("authExpiresAt");
    }
};

export default authService;