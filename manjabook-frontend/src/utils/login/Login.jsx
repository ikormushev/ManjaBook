import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {useAuth} from "../../context/authProvider/AuthProvider.jsx";
import {Box, Button, CircularProgress, TextField, Typography} from '@mui/material';
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import API_ENDPOINTS from "../../apiConfig.js";
import {useSuccess} from "../../context/successProvider/SuccessProvider.jsx";

export default function Login() {
    const { setError } = useError();
    const {setSuccess} = useSuccess();
    const [loading, setLoading] = useState(false);

    const [formErrors, setFormErrors] = useState({ email: "", password: "" });
    const [formValues, setFormValues] = useState({
        email: "",
        password: "",
    })
    const navigate = useNavigate();
    const { setAuthState } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        const newErrors = { email: "", password: ""};

        if (!formValues.email) newErrors.email = 'Email is required';
        if (!formValues.password) newErrors.password = 'Password is required';

        if (newErrors.email || newErrors.password) {
            setFormErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(API_ENDPOINTS.login, {
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
                setSuccess('Successful login!');
                navigate('/');
            } else {
                setError("Invalid email or password!");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
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
                            error={!!formErrors.email}
                            helperText={formErrors.email}
                            disabled={loading}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            name="password"
                            value={formValues.password}
                            onChange={changeHandler}
                            fullWidth
                            required
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ padding: 1.5 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : "Login"}
                        </Button>
                    </Box>

                    <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                        Don't have an account?{' '}
                        (<Link to='/register'>Register</Link>)
                    </Typography>
                </Box>
            </Box>
        </>
    );
};