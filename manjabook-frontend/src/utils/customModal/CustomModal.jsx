import { Modal as MUIModal, Box} from '@mui/material';


export default function CustomModal({ isOpen, onClose, children }) {
    return (
        <MUIModal open={isOpen} onClose={onClose}>
            <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxHeight: '80vh',
                    backgroundColor: 'background.paper',
                    boxShadow: 24,
                    p: 3,
                    borderRadius: 2,
                    overflowY: 'auto',
                }}
            >
                {children}
            </Box>
        </MUIModal>
    );
}
