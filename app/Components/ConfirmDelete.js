import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

export default function ConfirmDelete({ show, onCancel, onDelete }) {
    return (
        <div className='fixed z-50'>
        <Dialog className='bg-black' open={show} onClose={onCancel} fullWidth maxWidth="sm">
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
                Are you sure you want to delete this item?
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={onCancel} style={{backgroundColor:'black', color:'white'}}>
                    Cancel
                </Button>
                <Button variant="contained" style={{backgroundColor:'#ff0050', color:'white'}} onClick={onDelete}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
        </div>
        
    );
};
