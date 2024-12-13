import { Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";
import Loading from "../loading/Loading.jsx";


export default function ProtectedRoute() {
    const { authState } = useAuth();
    const isAuthenticated = authState.isAuthenticated;

    if (authState.loading) return <Loading/>;
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
