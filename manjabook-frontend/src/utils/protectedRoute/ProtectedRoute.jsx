import { Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";


export default function ProtectedRoute() {
    const { authState } = useAuth();
    const isAuthenticated = authState.isAuthenticated;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
