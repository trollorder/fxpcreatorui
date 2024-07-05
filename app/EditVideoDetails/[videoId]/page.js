'use client'
import React, { use } from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FormControl, Input, Typography, Button } from '@mui/material';
import ClipLoader from "react-spinners/ClipLoader";
import { useRouter } from 'next/navigation';
import BottomBar from '@/app/Components/BottomBar';

export default function  EditVideoDetailsPage() {
    const router = useRouter();
    const [s3ObjectKeyNoVideo,setS3ObjectKeyNoVideo] = useState(null);
    const [keyframesBase64, setKeyframesBase64] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const [videoDetails, setVideoDetails] = useState({});
    const [audioBase64, setAudioBase64] = useState(null);
    const [mp3Loading, setMp3Loading] = useState(false);
    const [isTranscriptGenerated, setIsTranscriptGenerated] = useState(false);
    const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
    const [currentDescription, setCurrentDescription] = useState('');
    const [currentDescriptionIdx, setCurrentDescriptionIdx] = useState(0);
    const username = 'kelvin'
    
    async function getFirstKeyFrame(s3ObjectKeyNoVideo){
        const s3ObjectKey = 'videos/'+s3ObjectKeyNoVideo;
        console.log(s3ObjectKey)
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/get-keyframe-for-video-base64?username=${username}&s3ObjectKey=${s3ObjectKey}&keyframeIndex=${0}`);
            console.log(response.data);
            if (response.data.error) {
                console.log(response.data.error);
                setIsTranscriptGenerated(false);
                return false;
            }
            setIsTranscriptGenerated(true);
            getVideoDetails(s3ObjectKeyNoVideo);
            getAllKeyFrames(s3ObjectKeyNoVideo);
            setKeyframesBase64({...keyframesBase64, 0: response.data});
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
        
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


    function handleSubmit(newTitleLocal){
        const s3ObjectKey = 'videos/'+s3ObjectKeyNoVideo;
        axios.put(`${process.env.NEXT_PUBLIC_backendUrl}/update-video-title?username=${username}&s3ObjectKey=${s3ObjectKey}&newTitle=${newTitleLocal}`)
            .then((res) => {
            console.log(res.data);
            getVideoDetails(s3ObjectKeyNoVideo);
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
        setMp3Loading(true);
        const s3ObjectKey = 'videos/'+s3ObjectKeyNoVideo;
        axios.post(`${process.env.NEXT_PUBLIC_backendUrl}/generate-audio-for-transcript?username=${username}&s3ObjectKey=${s3ObjectKey}`)
            .then((res) => {
            const localAudioBase64 = res.data['audioBase64'];
            setAudioBase64(localAudioBase64);
            setMp3Loading(false);
            })
            .catch((err) => {
            console.log(err);
            });
    }

    function handleGenerateInitialTranscript(){
        const s3ObjectKey = 'videos/'+s3ObjectKeyNoVideo;
        setIsGeneratingTranscript(true);
        axios.post(`${process.env.NEXT_PUBLIC_backendUrl}/generate-transcript_v2?username=${username}&s3ObjectKey=${s3ObjectKey}`)
            .then((res) => {
            console.log(res.data);
            getFirstKeyFrame(s3ObjectKeyNoVideo);
            setIsTranscriptGenerated(true);
            setIsGeneratingTranscript(false);
            getAllKeyFrames(s3ObjectKeyNoVideo);
            getVideoDetails(s3ObjectKeyNoVideo);
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

        const isGenerated = getFirstKeyFrame(returnval);

    },[]);

    
    return (
        <div className='min-h-screen bg-black text-white p-10 pb-20'>
            <Typography>Edit Video Details</Typography>
            <Typography variant='caption'>{videoDetails['videoName']}</Typography>
            {keyframesBase64 && <img src={keyframesBase64[0]['imageBase64']} style={{width:400, height:300, objectFit:'contain'}}/>}
            <Input className='bg-white m-2 p-2  rounded-xl' placeholder='Enter New Video Title' required onChange={(e) => setNewTitle(e.target.value)} />
            <Button style={{backgroundColor:'white', color:'black'}} variant='contained' color='primary' onClick={() => handleSubmit(newTitle)}>
                Submit
            </Button>

            {!isTranscriptGenerated && 
                <div className='flex flex-col'>
                    
                    {!isGeneratingTranscript?<Typography variant='caption'>Transcript not generated yet</Typography> : <ClipLoader color='white'/>}
                    <Button style={{backgroundColor:'white', color:'black'}} variant='contained' onClick={() => handleGenerateInitialTranscript()}>Generate Transcript Now</Button>
                </div>
            }
            {isTranscriptGenerated && <div>
                <Button variant='contained' color='primary' style={{backgroundColor:'white', color:'black'}} onClick={() => handleGetMP3()}>
                    Listen to current transcript
                </Button>
                <div className='w-full flex justify-center p-2'>
                {mp3Loading && <ClipLoader color='white'/>} {/* Add this line for the spinner */}
                </div>

                {audioBase64 && <audio controls key={audioBase64}>
                    <source src={audioBase64} type='audio/mpeg' />
                </audio>}
                <Typography className='text-white'>{currentDescription}</Typography>
                <Button size='small' style={{backgroundColor:'white', color:'black', fontWeight:'bolder'}} variant='contained' onClick={() => router.push(`/EditDescription/${s3ObjectKeyNoVideo}?keyframeIndex=${currentDescriptionIdx}`)}>Edit Keyframe</Button>

                <Typography>All Keyframes</Typography>
                <div className="max-w-screen-xl  flex overflow-auto flex-initial gap-4">
                {keyframesBase64 &&
                    Object.keys(keyframesBase64).map((key) => (
                    <button onClick={()=> {setCurrentDescriptionIdx(key); setCurrentDescription(keyframesBase64[key]['description'])}} className=" flex-shrink-0 rounded-xl w-48" key={key}>
                        {/* <Typography variant='caption'>Keyframe {parseInt(key) + 1}</Typography> */}
                        <img src={keyframesBase64[key]["imageBase64"]} alt={`Keyframe ${key + 1}`} style={{width:200, height:150, justifyContent:'center', objectFit:'cover'}}/>
                        <Typography variant="caption">
                            {numbertoTimeConverter(keyframesBase64[key]["filteredFrameIndexTimestamp"] + 1)}
                        </Typography>
                        {/* <Button
                        size='small'
                        style={{ backgroundColor: "white", color: "black", fontWeight: "bolder", fontSize: "0.5rem"}}
                        variant="contained"
                        onClick={() =>
                            router.push(
                            `/EditDescription/${s3ObjectKeyNoVideo}?keyframeIndex=${key}`
                            )
                        }
                        >
                        Edit Description
                        </Button> */}
                    </button>
                    ))}
                </div>
            </div>}
            <BottomBar/>
            </div>
        );
}

