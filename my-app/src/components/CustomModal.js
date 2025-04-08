import React from 'react';

// import material UI components
import { Modal, Box, IconButton } from "@mui/material";

// import icons
import CloseIcon from '@mui/icons-material/Close';

const CustomModal = (props) => {
    const { open, handleClose, content } = props
    return (
        <Modal
                    open={open}
                    onClose={handleClose}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            padding: '20px'
                        }}>
                        <IconButton
                            aria-label="close"
                            onClick={handleClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        {content}
                    </Box>
                </Modal>
    )
}

export default CustomModal;