import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";

const apiLoginURL = import.meta.env.VITE_LOGIN_BACKEND_URL;

export default function Login() {
    const [error, setError] = useState('');
    const [formValues, setFormValues] = useState({
        email: "",
        password: "",
    })
    const navigate = useNavigate();
    const { setAuthState } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(apiLoginURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formValues),
                credentials: 'include', // later - same-origin
            });

            if (response.ok) {
                const data = await response.json();
                setAuthState({
                    isAuthenticated: true,
                    username: data.username,
                    userID: data.userID,
                });
                navigate('/');
            }
        } catch (error) {
            setError(error);
        }
    };

    const changeHandler = (e) => {
        setFormValues(oldValues => ({
            ...oldValues,
            [e.target.name]: e.target.value,
        }))
    }

    return (
        <>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input
                    name="email"
                    type="text"
                    value={formValues.email}
                    onChange={changeHandler}
                    placeholder="Email"
                />
                <input
                    name="password"
                    type="password"
                    value={formValues.password}
                    onChange={changeHandler}
                    placeholder="Password"
                />
                <button type="submit">Login</button>
            </form>
            {error && <p>{error}</p>}
        </>
    );
};