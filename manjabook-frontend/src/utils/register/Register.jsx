import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Alert, Box, Button, TextField, Typography} from "@mui/material";

const apiRegisterURL = import.meta.env.VITE_REGISTER_BACKEND_URL;

export default function Register() {
    const [errors, setErrors] = useState({ email: "", username: "", password: "", general: "" });
    const [formValues, setFormValues] = useState({
        email: "",
        username: "",
        password: "",
    })
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        const newErrors = { email: "", username: "", password: "", general: "" };

        if (!formValues.email) newErrors.email = 'Email is required';
        if (!formValues.username) newErrors.email = 'Username is required';
        if (!formValues.password) newErrors.password = 'Password is required';

        if (newErrors.email || newErrors.username || newErrors.password) {
            setErrors(newErrors);
            return;
        }

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
                console.log(errorData)
                setErrors((oldValues) => ({
                    ...oldValues,
                    ...errorData
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

        setErrors((oldValues) => ({...oldValues, [e.target.name]: "", general: ""}));
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
                        error={!!errors.email}
                        helperText={errors.email}
                    />
                    <TextField
                        label="Username"
                        type="text"
                        name="username"
                        value={formValues.username}
                        onChange={changeHandler}
                        fullWidth
                        required
                        error={!!errors.username}
                        helperText={errors.username}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        name="password"
                        value={formValues.password}
                        onChange={changeHandler}
                        fullWidth
                        required
                        error={!!errors.password}
                        helperText={errors.password}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ padding: 1.5 }}
                    >
                        Register
                    </Button>
                </Box>

                <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                    Already have an account?{' '}
                    (<Link to='/login'>Login</Link>)
                </Typography>
            </Box>
        </Box>
    );
};