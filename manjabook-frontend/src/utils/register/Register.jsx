import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Box, Button, CircularProgress, TextField, Typography} from "@mui/material";
import API_ENDPOINTS from "../../apiConfig.js";
import {useError} from "../../context/errorProvider/ErrorProvider.jsx";
import {useSuccess} from "../../context/successProvider/SuccessProvider.jsx";


export default function Register() {
    const navigate = useNavigate();
    const {setError} = useError();
    const {setSuccess} = useSuccess();
    const [loading, setLoading] = useState(false);

    const [formErrors, setFormErrors] = useState({ email: "", username: "", password: "" });
    const [formValues, setFormValues] = useState({
        email: "",
        username: "",
        password: "",
    })

    const handleRegister = async (e) => {
        e.preventDefault();

        const newErrors = { email: "", username: "", password: "", general: "" };

        if (!formValues.email) newErrors.email = 'Email is required';
        if (!formValues.username) newErrors.email = 'Username is required';
        if (!formValues.password) newErrors.password = 'Password is required';

        if (newErrors.email || newErrors.username || newErrors.password) {
            setFormErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.register, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formValues),
                credentials: 'include', // later - same-origin
            });

            if (response.ok) {
                setSuccess('Successfully registered. Login now!');
                navigate('/login');
            } else {
                const errorData = await response.json();

                setFormErrors((oldValues) => ({
                    ...oldValues,
                    ...errorData
                }));
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

        setFormErrors((oldValues) => ({...oldValues, [e.target.name]: ""}));
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
                    Register
                </Typography>

                <Box
                    component="form"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                    onSubmit={handleRegister}
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
                        label="Username"
                        type="text"
                        name="username"
                        value={formValues.username}
                        onChange={changeHandler}
                        fullWidth
                        required
                        error={!!formErrors.username}
                        helperText={formErrors.username}
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
                        error={!!formErrors.password}
                        helperText={formErrors.password}
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
                        {loading ? <CircularProgress size={24} /> : "Register"}
                    </Button>
                </Box>

                <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                    Already have an account?{' '}
                    (<Link to='/login'><b>Login</b></Link>)
                </Typography>
            </Box>
        </Box>
    );
};