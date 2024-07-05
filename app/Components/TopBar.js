import { Icon, IconButton } from '@mui/material';
import React from 'react';


const TopBar = () => {
    return (
        <div className="top-bar">
            <IconButton>
                <Icon icon='menu' />
            </IconButton>
        </div>
    );
};

export default TopBar;