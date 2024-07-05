import React from 'react';
import AbcIcon from '@mui/icons-material/Abc';
import { IconButton } from '@mui/material';

const BottomBar = () => {
    return (
        <div className="flex justify-around items-center bg-white h-16 w-full border-t border-gray-300">
            <IconButton>
                <AbcIcon />
            </IconButton>
        </div>
    );
};

export default BottomBar;