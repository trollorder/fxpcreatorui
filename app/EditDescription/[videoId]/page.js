'use client'
import React, { useEffect } from 'react';
import { useRouter, useSearchParams} from 'next/navigation';
import { useState } from 'react';
import { Typography } from '@mui/material';
import axios from 'axios';
const Page = () => {
    const router = useRouter();
    const [username, setUsername] = useState("kelvin");
    const [s3ObjectKeyNoVideo,setS3ObjectKeyNoVideo] = useState(null);
    const [keyframeDict, setKeyframeDict] = useState(null);
    const searchParams = useSearchParams()
    const keyframeIndex = searchParams.get('keyframeIndex')


    function getFirstKeyFrame(s3ObjectKey){
        axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/get-keyframe-for-video-base64?username=${username}&s3ObjectKey=videos/${s3ObjectKey}&keyframeIndex=${0}`).then((res) => {
            console.log(res.data);
            setKeyframeDict(res.data)
        });
    }


    useEffect(() => {
        var videoId = ''
        if (typeof window !== 'undefined') {
            const videoIdAndIndex = window.location.pathname.split('/').pop();
            videoId = videoIdAndIndex.split('?')[0];
            setS3ObjectKeyNoVideo(videoId); 
            getFirstKeyFrame(videoId);           
        }
        
    }, []);

    return (
        <div className='bg-white h-screen p-10'>
            <Typography>{s3ObjectKeyNoVideo}</Typography>
            <Typography>{keyframeIndex}</Typography>
            {keyframeDict && 
            <div>
                <img src={keyframeDict.imageBase64}/>
                <Typography variant='h6'>Keyframe Index: {keyframeDict['keyframeIndex']}</Typography>
                <Typography variant='caption'>{keyframeDict['description']}</Typography>
            </div>
            }
        </div>
    );
};

export default Page;