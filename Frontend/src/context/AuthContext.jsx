import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);


    // --------------------------------------------------
    // RESTORE AUTHENTICATION ON PAGE REFRESH
    // --------------------------------------------------

    useEffect(() => {

        try {

            const storedUser =
                authService.getCurrentUser();

            setUser(storedUser);

        } catch (error) {

            console.error(
                "Failed to restore authentication:",
                error
            );

            authService.logout();

            setUser(null);

        } finally {

            setLoading(false);

        }

    }, []);


    // --------------------------------------------------
    // LOGIN
    // --------------------------------------------------

    const login = async (credentials, password, expectedRole) => {
        let payload;
        if (typeof credentials === "object" && credentials !== null) {
            payload = credentials;
            if (!expectedRole && credentials.role) {
                expectedRole = credentials.role;
            }
        } else {
            payload = { email: credentials, password, role: expectedRole };
        }

        const result = await authService.login(payload, password, expectedRole);

        if (result?.success && result?.data?.user) {
            setUser(result.data.user);
            return result.data.user;
        }

        if (result?.user) {
            setUser(result.user);
            return result.user;
        }

        if (result?.success === false) {
            setUser(null);
            throw new Error(result?.message || "Invalid email or password.");
        }

        return result;
    };


    // --------------------------------------------------
    // REGISTER
    // --------------------------------------------------

    const register = async (userData) => {

        return await authService.register(
            userData
        );

    };


    // --------------------------------------------------
    // LOGOUT
    // --------------------------------------------------

    const logout = () => {

        authService.logout();

        setUser(null);

    };


    // --------------------------------------------------
    // AUTHENTICATION STATUS
    // --------------------------------------------------

    const isAuthenticated =
        !!user;


    // --------------------------------------------------
    // CONTEXT VALUE
    // --------------------------------------------------

    const value = {

        user,

        loading,

        isAuthenticated,

        login,

        register,

        logout

    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


// --------------------------------------------------
// CUSTOM HOOK
// --------------------------------------------------

export function useAuth() {

    const context =
        useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }

    return context;
}