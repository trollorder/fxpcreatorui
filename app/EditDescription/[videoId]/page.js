'use client'
import React, { useEffect } from 'react';
import { useRouter, useSearchParams} from 'next/navigation';
import { useState } from 'react';
import { Button, Typography, TextField } from '@mui/material';
// import Cliploader from "react-spinners/ClipLoader";
import axios from 'axios';
import BottomBar from '@/app/Components/BottomBar';

const Page = () => {
    const router = useRouter();
    const [username, setUsername] = useState("kelvin");
    const [s3ObjectKeyNoVideo,setS3ObjectKeyNoVideo] = useState(null);
    const [keyframeDict, setKeyframeDict] = useState(null);
    const [newDescription, setNewDescription] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const searchParams = useSearchParams()
    const keyframeIndex = searchParams.get('keyframeIndex')


    function getkeyframeDict(s3ObjectKey,keyframeIndex){
        axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/get-keyframe-for-video-base64?username=${username}&s3ObjectKey=videos/${s3ObjectKey}&keyframeIndex=${keyframeIndex}`).then((res) => {
            console.log(res.data);
            setKeyframeDict(res.data)
            setNewDescription(res.data['description'])
        });
    }
    function numbertoTimeConverter(number){
        var timestamp = ''
        var hours = Math.floor(number / 3600);
        var minutes = Math.floor((number - (hours * 3600)) / 60);
        if (minutes <1) {
            minutes = '00'
        }
        var seconds = number - (hours * 3600) - (minutes * 60);
        if (seconds < 10) {
            seconds = '0' + seconds
        }
        timestamp =  minutes + ':' + seconds;

        return timestamp
    }

    function handleSaveDescription(){
        axios.put(`${process.env.NEXT_PUBLIC_backendUrl}/edit-keyframe-description?username=${username}`, {
            's3ObjectKey': 'videos/' + s3ObjectKeyNoVideo,
            'keyframeIndex': keyframeIndex,
            'newDescription': newDescription
        })
            .then((res) => {
            console.log(res.data);
            // Reload
            getkeyframeDict(s3ObjectKeyNoVideo,keyframeIndex);
            })
            .catch((err) => {
            console.log(err);
        })
    }
    
    function handleRegenerateKeyframeDescription(){
        setIsRegenerating(true);
        axios.post(`${process.env.NEXT_PUBLIC_backendUrl}/regenerate-keyframe-description?username=${username}`, {
            's3ObjectKey': 'videos/' + s3ObjectKeyNoVideo,
            'keyframeIndex': keyframeIndex
        })
            .then((res) => {
            console.log(res.data);
            getkeyframeDict(s3ObjectKeyNoVideo,keyframeIndex);
            setIsRegenerating(false);
            })
            .catch((err) => {
            console.log(err);
        })
    
    }


    useEffect(() => {
        var videoId = ''
        if (typeof window !== 'undefined') {
            const videoIdAndIndex = window.location.pathname.split('/').pop();
            videoId = videoIdAndIndex.split('?')[0];
            setS3ObjectKeyNoVideo(videoId); 
            getkeyframeDict(videoId,keyframeIndex);           
        }
        
    }, []);

    return (
        <div className='bg-black h-screen p-10 overflow-auto text-white flex flex-col gap-2'>
            <Typography variant='h5'>Edit Keyframe Description</Typography>
            <Typography></Typography>
            {keyframeDict && 
            <div className='flex flex-col overflow-auto w-full max-h-screen'>
                <img src={keyframeDict.imageBase64} style={{maxWidth: '400px', maxHeight: '400px', objectFit: 'cover'}} className='rounded-2xl'/>
                <Typography variant='h6'>Timestamp {numbertoTimeConverter(keyframeDict['filteredFrameIndexTimestamp']+1)}</Typography>
                {
                    isEditing ?
                    <textarea variant='caption' onChange={(e)=>setNewDescription(e.target.value)} value={newDescription} style={{height:'10em', fontSize:'0.9rem'}}>{keyframeDict['description']}</textarea>
                    :
                    <Typography variant='caption'>{keyframeDict['description']}</Typography>
                }
                
                {isEditing?
                <Button style={{backgroundColor:'white', color:'black', fontWeight:'bolder'}} onClick={()=>{setIsEditing(false); handleSaveDescription()}}>Save Description</Button>
                :
                <Button style={{backgroundColor:'white', color:'black', fontWeight:'bolder'}} onClick={()=>{setIsEditing(true)}}>Edit Description</Button>
                }
                
                {isRegenerating && 
                <div className='flex justify-center'>
                    <Typography variant='subtitle'>Regenerating Description</Typography>
                    {/* <Cliploader loading={isRegenerating} color='blue'/> */}
                </div>
                }
                <Button className='mt-4 p-2' style={{color:'red', backgroundColor:'white'}} variant='contained' disabled={isRegenerating} onClick={()=>{handleRegenerateKeyframeDescription()}}>Regenerate Description</Button>
            </div>
            }
        <BottomBar/>
        </div>
    );
};

export default Page;