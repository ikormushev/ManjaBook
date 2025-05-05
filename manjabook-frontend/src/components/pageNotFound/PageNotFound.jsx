import { Box, Typography, Button } from '@mui/material';
import {NavLink} from 'react-router-dom';

export default function PageNotFound() {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                margin: "auto 0",
                gap: 1
            }}
        >

            <Typography
                sx={{
                    fontSize: "5em",
                    fontWeight: "bold",
                    color: "primary.main",
                }}
            >
                404
            </Typography>
            <Typography
                variant="h5"
            >
                Oops! Page not found.
            </Typography>
            <Typography
                variant="body1"
                sx={{ color: "text.secondary"}}
            >
                The page you’re looking for doesn’t exist.
            </Typography>
            <Button
                variant="contained"
                color="success"
                to="/"
                sx={{
                    fontSize: "1.2em",
                    '&:hover': {
                        backgroundColor: 'success.dark',
                    },
                    mt: 2
                }}
            >
                <NavLink to="/">Go back home</NavLink>
            </Button>
        </Box>
    );
}
