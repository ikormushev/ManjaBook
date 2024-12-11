import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";
import {Alert, Box, Button, TextField, Typography} from '@mui/material';

const apiLoginURL = import.meta.env.VITE_LOGIN_BACKEND_URL;

export default function Login() {
    const [errors, setErrors] = useState({ email: "", password: "", general: "" });
    const [formValues, setFormValues] = useState({
        email: null,
        password: null,
    })
    const navigate = useNavigate();
    const { setAuthState } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        const newErrors = { email: "", password: "", general: "" };

        if (!formValues.email) newErrors.email = 'Email is required';
        if (!formValues.password) newErrors.password = 'Password is required';

        if (newErrors.email || newErrors.password) {
            setErrors(newErrors);
            return;
        }

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
                    userID: data.user_id,
                });
                navigate('/');
            } else {
                setErrors(oldValues => ({
                    ...oldValues,
                    general: "Invalid email or password!",
                }));
            }
        } catch (error) {
            setErrors(oldValues => ({
                ...oldValues,
                general: error.message,
            }));
        }
    };

    const changeHandler = (e) => {
        setFormValues(oldValues => ({
            ...oldValues,
            [e.target.name]: e.target.value,
        }))
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: 3,
                backgroundColor: '#f4f4f4',
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 400,
                    backgroundColor: 'white',
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Typography variant="h4" textAlign="center" gutterBottom>
                    Login
                </Typography>

                {errors.general && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errors.general}
                    </Alert>
                )}

                <Box
                    component="form"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                    onSubmit={handleLogin}
                >
                    <TextField
                        label="Email"
                        type="text"
                        value={formValues.email}
                        onChange={changeHandler}
                        fullWidth
                        required
                        name="email"
                        error={!!errors.email}
                        helperText={errors.email}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        name="password"
                        value={formValues.password}
                        onChange={changeHandler}
                        fullWidth
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ padding: 1.5 }}
                    >
                        Login
                    </Button>
                </Box>

                <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                    Don't have an account?{' '}
                    (<Link to='/register'>Register</Link>)
                </Typography>
            </Box>
        </Box>
    );
};