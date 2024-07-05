'use client'
import React, { use } from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FormControl, Input, Typography, Button } from '@mui/material';
export default function  EditVideoDetailsPage() {
    const [s3ObjectKeyNoVideo,setS3ObjectKeyNoVideo] = useState(null);
    const [keyframesBase64, setKeyframesBase64] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const [videoDetails, setVideoDetails] = useState({});
    const [audioBase64, setAudioBase64] = useState(null);
    const username = 'kelvin'
    
    async function getFirstKeyFrame(s3ObjectKeyNoVideo){
        const s3ObjectKey = 'videos/'+s3ObjectKeyNoVideo;
        console.log(s3ObjectKey)
        await axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/get-keyframe-for-video-base64?username=${username}&s3ObjectKey=${s3ObjectKey}&keyframeIndex=${0}`).then((res) => {
          console.log(res.data);
          setKeyframesBase64({...keyframesBase64, 0: res.data})
        });
        
    }

    function handleSubmit(newTitleLocal){
        const s3ObjectKey = 'videos/'+s3ObjectKeyNoVideo;
        axios.put(`${process.env.NEXT_PUBLIC_backendUrl}/update-video-title?username=${username}&s3ObjectKey=${s3ObjectKey}&newTitle=${newTitleLocal}`)
            .then((res) => {
            console.log(res.data);
            })
            .catch((err) => {
            console.log(err);
            });
    }
    function getVideoDetails(s3StringNovideo){
        const s3ObjectKey = 'videos/'+s3StringNovideo;
        axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/video-details?username=${username}&s3ObjectKey=${s3ObjectKey}`)
            .then((res) => {
            console.log(res.data);
            setVideoDetails(res.data);

            })
            .catch((err) => {
            console.log(err);
            });
    }

    function getAllKeyFrames(s3String){
        const s3ObjectKey = 'videos/'+s3String;
        axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/get-all-keyframes-for-video-base64?username=${username}&s3ObjectKey=${s3ObjectKey}`)
            .then((res) => {
            const keyframeslocalDict = res.data['keyframes'];
            console.log(keyframeslocalDict);
            for (const key of Object.keys(keyframeslocalDict)){
                setKeyframesBase64(prevState => ({...prevState, [key]: keyframeslocalDict[key]}))
            }
            })
    }
    function handleGetMP3(){
        const s3ObjectKey = 'videos/'+s3ObjectKeyNoVideo;
        axios.post(`${process.env.NEXT_PUBLIC_backendUrl}/generate-audio-for-transcript?username=${username}&s3ObjectKey=${s3ObjectKey}`)
            .then((res) => {
            const localAudioBase64 = res.data['audioBase64'];
            setAudioBase64(localAudioBase64);
            })
            .catch((err) => {
            console.log(err);
            });
    }
    
    useEffect(() => {
        var returnval = ''
        if (typeof window !== 'undefined') {
            returnval = window.location.pathname.split('/').pop();
            setS3ObjectKeyNoVideo(returnval);
        }

        getFirstKeyFrame(returnval);
        getVideoDetails(returnval);
        getAllKeyFrames(returnval);

    },[]);

    
    return (
        <div className='min-h-screen bg-white p-10'>
            <Typography>Edit Video Details</Typography>
            <Typography variant='caption'>Video Title: {}</Typography>
            <Typography variant='caption'>Video Frame</Typography>
            {keyframesBase64 && <img src={keyframesBase64[0]['imageBase64']} />}
            {videoDetails && <Typography variant='h6'>Video Title: {videoDetails['videoName']}</Typography>}
            <Typography variant='caption'>Edit Video Title</Typography>
            
            <FormControl>
                <Input placeholder='Enter New Video Title' required onChange={(e) => setNewTitle(e.target.value)} />
                <Button variant='contained' color='primary' onClick={() => handleSubmit(newTitle)}>
                    Submit
                </Button>
            </FormControl>

            <Typography variant='caption'>Get MP3</Typography>
            <Button variant='contained' color='primary' onClick={() => handleGetMP3()}>
                Get MP3
            </Button>
            <audio controls key={audioBase64}>
                <source src={audioBase64} type='audio/mpeg' />
            </audio>

            <Typography>All Keyframes</Typography>
            {keyframesBase64 && Object.keys(keyframesBase64).map((key) => {
                var isEditingLocal = false;
                return(
                <div key={key}>
                    <Typography variant='caption'>Keyframe {parseInt(key) + 1}</Typography>
                    <img src={keyframesBase64[key]['imageBase64']} />
                    <Typography variant='body2'>{keyframesBase64[key]['description']}</Typography>
                    <Button variant='contained' onChange={() => isEditingLocal = true}>Edit Description</Button>
                    {isEditingLocal && <FormControl>
                        <Input placeholder='Enter New Description' required />
                        <Button variant='contained' color='primary'>Submit</Button>
                    </FormControl>}
                </div>)
            })}
            
        </div>
    );
}

