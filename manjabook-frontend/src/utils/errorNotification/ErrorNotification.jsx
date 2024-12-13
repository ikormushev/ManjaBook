import { Snackbar, Alert } from '@mui/material';

export default function ErrorNotification({ error, clearError }) {
    return (
        <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={clearError}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        >
            <Alert onClose={clearError} severity="error" sx={{width: '100%'}}>
                {error}
            </Alert>
        </Snackbar>
    );
}