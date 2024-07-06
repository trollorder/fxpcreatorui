'use client'
import { Typography, Input, Button} from '@mui/material';
import React, { useState, useCallback } from 'react';
import {useDropzone} from 'react-dropzone'
import { ClipLoader } from 'react-spinners';
import axios from 'axios';
import BottomBar from '../Components/BottomBar';
import { useRouter } from 'next/navigation';

const UploadVideoPage = () => {
    const router = useRouter();
    const [videoName, setVideoName] = useState('');
    const [fileUpload , setFileUpload] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const username = 'kelvin';
    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        if (file.name.endsWith('.mp4') || file.name.endsWith('.MP4')) {
            // File is an mp4
            if (file.size <= 50 * 1024 * 1024) {
                setFileUpload(file);
            } else {
                console.log('File size exceeds 50MB');
            }
        } else {
            // File is not an mp4
            console.log('Please select an mp4 file');
            return;
        }
    }, []);

    async function uploadVideo(){
        if (fileUpload) {
            const formData = new FormData();
            formData.append('video', fileUpload);
            setIsUploading(true);
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_backendUrl}/upload-video?username=${username}&videoName=${videoName}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                setIsUploading(false);
                setFileUpload(null);
                console.log(response.data);
                router.push('/');
            } catch (error) {
                console.error(error);
            }
        } else {
            console.log('Please select a file');
        }
    };

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return (
        <div className='w-full h-screen overflow-auto bg-black text-white p-10'>
            <Typography variant='h5' style={{fontWeight:'bolder'}} className='px-2 mb-2'>Upload Video</Typography>
            {!fileUpload ? <div {...getRootProps()} className='bg-white h-1/3 text-black p-2 rounded-2xl'>
                <input {...getInputProps()} />
                {
                    isDragActive ?
                    <Typography style={{fontWeight:'bolder'}}>Drop Files</Typography>:
                    <Typography style={{fontWeight:'bolder'}}>Drag and Upload Files Here. Or Click Here. Mp4 Files Only</Typography>
                }
            </div>
            : <div className='bg-white h-1/3 text-black p-2 rounded-2xl'>
                <video src={URL.createObjectURL(fileUpload)} controls className='w-full h-full' />
                </div>
            }
            {fileUpload &&
            <div className='bg-white w-full text-black rounded-xl mt-2 p-2'>
                <Typography>Selected File: {fileUpload.name}</Typography>
                <div className='w-full justify-center flex flex-col'>
                    <Typography>Uploading</Typography>
                    <ClipLoader color='#000' loading={isUploading} size={30} />
                </div>
                <Input placeholder='Video Name' onChange={(e) => setVideoName(e.target.value)} />
                <Button disabled={isUploading} style={{color:'white', fontWeight:'bolder', backgroundColor:'black'}} variant='contained' onClick={uploadVideo}>Upload</Button>
                <Button className='w-full' style={{backgroundColor:'darkred', color:'white', fontWeight:'bolder'}} disabled={isUploading} onClick={() => setFileUpload(null)}>Cancel</Button>
            </div>
            }
        <BottomBar/>
        </div>
    );
};

export default UploadVideoPage;