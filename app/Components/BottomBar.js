import React from 'react';
import AbcIcon from '@mui/icons-material/Abc';
import { IconButton } from '@mui/material';
import { Add, AddCircleTwoTone, Home, Menu } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const BottomBar = () => {
    const router = useRouter();
    return (
        <div className="flex fixed bottom-0 left-0 justify-around items-center bg-white h-16 w-full border-t border-gray-300">
            <IconButton >
                <Menu/>
            </IconButton>
            
            <IconButton onClick={()=> router.push('/UploadVideo')}>
                <Add style={{backgroundColor:'red', color:'white', fontSize:'40'}} className='rounded-xl' />
            </IconButton>
            <IconButton onClick={()=> router.push('/')}>
                <Home />
            </IconButton>
        </div>
    );
};

export default BottomBar;