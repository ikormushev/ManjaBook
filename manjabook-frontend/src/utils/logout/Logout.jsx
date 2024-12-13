import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";
import styles from "./Logout.module.css";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";

export default function Logout() {
    const navigate = useNavigate();
    const {setError} = useError();
    const { setAuthState } = useAuth();

    const handleLogout = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.logout, {
                method: 'POST',
                credentials: 'include', // later - same-origin
            });

            if (response.ok) {
                navigate('/');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setAuthState({
                isAuthenticated: false,
                username: "",
                userID: "",
            });
        }
    };

    return (
        <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
        </button>
    );
}