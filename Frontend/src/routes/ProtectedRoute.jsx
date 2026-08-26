import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ allowedRoles = [] }) {
    const {
        user,
        loading,
        isAuthenticated
    } = useAuth();

    // --------------------------------------------------
    // WAIT FOR AUTH STATE TO BE RESTORED
    // --------------------------------------------------

    if (loading) {
        return (
            <div>
                Loading...
            </div>
        );
    }

    // --------------------------------------------------
    // NOT AUTHENTICATED
    // --------------------------------------------------

    if (!isAuthenticated || !user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // --------------------------------------------------
    // ROLE AUTHORIZATION
    // --------------------------------------------------

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
    ) {
        return (
            <Navigate
                to="/unauthorized"
                replace
            />
        );
    }

    // --------------------------------------------------
    // AUTHENTICATED + AUTHORIZED
    // --------------------------------------------------

    return <Outlet />;
}

export default ProtectedRoute;