import { Snackbar, Alert } from '@mui/material';

export default function BaseNotification({ notification, clearNotification, notificationType }) {
    return (
        <Snackbar
            open={!!notification}
            autoHideDuration={4000}
            onClose={clearNotification}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        >
            <Alert onClose={clearNotification} severity={notificationType} sx={{width: '100%'}}>
                {notification}
            </Alert>
        </Snackbar>
    );
}