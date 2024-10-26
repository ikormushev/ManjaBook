import {useState} from "react";
import {useNavigate} from "react-router-dom";

const apiRegisterURL = import.meta.env.VITE_REGISTER_BACKEND_URL;

export default function Register() {
    const [error, setError] = useState('');
    const [formValues, setFormValues] = useState({
        email: "",
        username: "",
        password: "",
    })
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(apiRegisterURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formValues),
                credentials: 'include', // later - same-origin
            });

            if (response.ok) {
                navigate('/login');
            } else {
                const errorData = await response.json();
                setError(JSON.stringify(errorData));
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
        <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input
                    name="email"
                    type="text"
                    value={formValues.email}
                    onChange={changeHandler}
                    placeholder="Email"
                />
                <input
                    name="username"
                    type="text"
                    value={formValues.username}
                    onChange={changeHandler}
                    placeholder="Username"
                />
                <input
                    name="password"
                    type="password"
                    value={formValues.password}
                    onChange={changeHandler}
                    placeholder="Password"
                />
                <button type="submit">Register</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};