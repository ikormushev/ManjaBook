import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";

const apiLogoutApi = import.meta.env.VITE_LOGOUT_BACKEND_URL;


export default function Logout() {
    const navigate = useNavigate();
    const { setAuthState } = useAuth();

    const handleLogout = async () => {
        try {
            const response = await fetch(apiLogoutApi, {
                method: 'POST',
                credentials: 'include', // later - same-origin
            });

            if (response.ok) {
                navigate('/');
            }
        } catch (error) {
            console.log(error);
        } finally {
            setAuthState({
                isAuthenticated: false,
                username: "",
                userID: "",
            });
        }
    };


    return (
        <button onClick={handleLogout}>Logout</button>
    );
}