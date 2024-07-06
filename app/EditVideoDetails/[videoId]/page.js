'use client'
import React, { use } from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FormControl, Input, Typography, Button, IconButton } from '@mui/material';
import ClipLoader from "react-spinners/ClipLoader";
import { useRouter } from 'next/navigation';
import BottomBar from '@/app/Components/BottomBar';
import { Check, Hearing } from '@mui/icons-material';

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
    const [currentDescription, setCurrentDescription] = useState(null);
    const [currentDescriptionIdx, setCurrentDescriptionIdx] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [newDescription, setNewDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const username = 'kelvin'
    
    async function getFirstKeyFrame(s3ObjectKeyNoVideo){
        const s3ObjectKey = 'videos/'+s3ObjectKeyNoVideo;
        console.log(s3ObjectKey)
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/get-keyframe-for-video-base64?username=${username}&s3ObjectKey=${s3ObjectKey}&keyframeIndex=${0}`);
            console.log(response.data);
            if (response.data.error) {
                getVideoDetails(s3ObjectKeyNoVideo);
                console.log(response.data.error);
                setIsTranscriptGenerated(false);
                setIsLoading(false);
                return false;
            }
            setIsTranscriptGenerated(true);
            getVideoDetails(s3ObjectKeyNoVideo);
            getAllKeyFrames(s3ObjectKeyNoVideo);
            setKeyframesBase64({...keyframesBase64, 0: response.data});
            setIsLoading(false);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
        
    }

    function getkeyframeDict(s3ObjectKey,keyframeIndex){
        console.log('updating keyframe dict')
        axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/get-keyframe-for-video-base64?username=${username}&s3ObjectKey=videos/${s3ObjectKey}&keyframeIndex=${keyframeIndex}`).then((res) => {
            console.log(res.data);
            setKeyframesBase64(prevState => ({...prevState, [keyframeIndex]: res.data}));
            setCurrentDescription(res.data['description']);
            return true
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
        setIsLoading(true);
        setMp3Loading(true);
        const s3ObjectKey = 'videos/'+s3ObjectKeyNoVideo;
        axios.post(`${process.env.NEXT_PUBLIC_backendUrl}/generate-audio-for-transcript?username=${username}&s3ObjectKey=${s3ObjectKey}`)
            .then((res) => {
            const localAudioBase64 = res.data['audioBase64'];
            setAudioBase64(localAudioBase64);
            setMp3Loading(false);
            setIsLoading(false);
            })
            .catch((err) => {
            console.log(err);
            });
    }

    function handleGenerateTranscript(forceGeneration = false){
        const s3ObjectKey = 'videos/'+s3ObjectKeyNoVideo;
        setIsLoading(true);
        if (forceGeneration) {
            setIsGeneratingTranscript(true);
            axios.post(`${process.env.NEXT_PUBLIC_backendUrl}/generate-transcript_v2?username=${username}&s3ObjectKey=${s3ObjectKey}&forceGeneration=true`)
            .then((res) => {
            console.log(res.data);
            getFirstKeyFrame(s3ObjectKeyNoVideo);
            setIsTranscriptGenerated(true);
            setIsGeneratingTranscript(false);
            getAllKeyFrames(s3ObjectKeyNoVideo);
            getVideoDetails(s3ObjectKeyNoVideo);
            setIsLoading(false);
            })
            .catch((err) => {
            console.log(err);
            });
        }
        else{
            axios.post(`${process.env.NEXT_PUBLIC_backendUrl}/generate-transcript_v2?username=${username}&s3ObjectKey=${s3ObjectKey}`)
            .then((res) => {
            console.log(res.data);
            getFirstKeyFrame(s3ObjectKeyNoVideo);
            setIsTranscriptGenerated(true);
            setIsGeneratingTranscript(false);
            getAllKeyFrames(s3ObjectKeyNoVideo);
            getVideoDetails(s3ObjectKeyNoVideo);
            setIsLoading(false);
            })
            .catch((err) => {
            console.log(err);
            });
        }
        
    }

    function handleSaveDescription(){
        setIsLoading(true);
        axios.put(`${process.env.NEXT_PUBLIC_backendUrl}/edit-keyframe-description?username=${username}`, {
            's3ObjectKey': 'videos/' + s3ObjectKeyNoVideo,
            'keyframeIndex': currentDescriptionIdx,
            'newDescription': newDescription
        })
            .then((res) =>{
            console.log(res.data);
                // Reload
                getkeyframeDict(s3ObjectKeyNoVideo, currentDescriptionIdx);
                setIsLoading(false);
            })
            .catch((err) => {
            console.log(err);
        })
    }
    
    function handleRegenerateKeyframeDescription(){
        setIsLoading(true);
        axios.post(`${process.env.NEXT_PUBLIC_backendUrl}/regenerate-keyframe-description?username=${username}`, {
            's3ObjectKey': 'videos/' + s3ObjectKeyNoVideo,
            'keyframeIndex': currentDescriptionIdx
        })
            .then((res) => {
            console.log(res.data);
            getkeyframeDict(s3ObjectKeyNoVideo,currentDescriptionIdx);
            setIsLoading(false);
            })
            .catch((err) => {
            console.log(err);
        })
    
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
            {isLoading && <div style={{zIndex:100, position:'fixed', top:200, left:80}}>
                <ClipLoader color='red' size={250} fontWeight='bold'/>
            </div>}
            {/* This is the Background  */}
            {keyframesBase64 && <img className='fixed top-10 rounded-2xl' src={keyframesBase64[currentDescriptionIdx]['imageBase64']} style={{width:'80%', height:'60%', objectFit:'cover'}}/>}
            <div>
                <Typography className='relative px-2' style={{zIndex:20, fontWeight:'bolder', fontSize:'1.5rem'}}>{videoDetails['videoName']}</Typography>
                <div className='flex justify-center items-center gap-1'>                
                    <Input className='bg-white m-2 p-2 rounded-xl' placeholder='Enter New Video Title' required onChange={(e) => setNewTitle(e.target.value)} />
                    <IconButton style={{backgroundColor:'white', color:'black', height:'2em'}} variant='contained' color='primary' onClick={() => handleSubmit(newTitle)}>
                        <Check/>
                    </IconButton>
                    {isTranscriptGenerated && 
                    <IconButton variant='contained' color='primary' style={{backgroundColor:'white', color:'black', height:'2em'}} onClick={() => handleGetMP3()}>
                            <Hearing/>
                    </IconButton>
                    }
                </div>
            </div>
            

            {!isTranscriptGenerated && 
                <div className='flex flex-col'>
                    {!isGeneratingTranscript?<Typography variant='caption'>Transcript not generated yet</Typography> : <ClipLoader color='white'/>}
                    <Button style={{backgroundColor:'white', color:'black'}} variant='contained' onClick={() => handleGenerateTranscript()}>Generate Transcript Now</Button>
                </div>
            }
            {isTranscriptGenerated && <div>
                
                {/* <div className='w-full flex justify-center p-2'>
                {mp3Loading && <ClipLoader color='white'/>} 
                </div> */}

                {audioBase64 && <audio controls key={audioBase64}>
                    <source src={audioBase64} type='audio/mpeg' />
                </audio>}
                {currentDescription && <div className='z-10 relative w-full flex flex-col justify-center items-center'>
                    <div>
                        {isEditing?
                        <textarea className='text-black rounded-xl p-2' variant='caption' onChange={(e)=>setNewDescription(e.target.value)} value={newDescription} style={{height:'15em', width:'22em', fontSize:'0.9rem'}}>{newDescription}</textarea>
                        :   
                        <Typography className='text-white z-10 bg-black bg-opacity-45 m-2 p-2 rounded-xl'>{currentDescription}</Typography>}
                    </div>
                    
                    { isEditing ? 
                    <Button size='small' style={{backgroundColor:'white', color:'black', fontWeight:'bolder'}} variant='contained' onClick={() => {setIsEditing(false); handleSaveDescription()}}>
                        Save Accessibility Text
                    </Button>
                    :
                    <div className='flex flex-col gap-2'>
                        <Button size='small' style={{backgroundColor:'white', color:'black', fontWeight:'bolder'}} variant='contained' onClick={() => {setIsEditing(true); setNewDescription(currentDescription)}}>
                            Edit Accessibility Text
                        </Button>
                        <Button size='small' style={{backgroundColor:'#ff0050', color:'white', fontWeight:'bolder'}} variant='contained' onClick={() => handleRegenerateKeyframeDescription()}>
                            Regenerate Accessibility Text
                        </Button>
                    </div>
                    }
                </div>}
                
                <div className='flex justify-center bottom-64 fixed' style={{width:'80%', alignSelf:'center'}}>
                    <Button style={{backgroundColor:'white', color:'black'}} variant='contained' size='small' onClick={() => handleGenerateTranscript(true)}>Generate New Transcript</Button>
                </div>
                <div className="w-5/6 flex overflow-auto flex-initial gap-4 fixed bottom-16" key={keyframesBase64}>
                    {keyframesBase64 &&
                        Object.keys(keyframesBase64).sort((a,b) => a['filteredFrameIndexTimestamp']<b['filteredFrameIndexTimestamp']).map((key) => (
                        <button onClick={()=> {setCurrentDescriptionIdx(key); setCurrentDescription(keyframesBase64[key]['description']);setIsEditing(false)}} className=" flex-shrink-0 rounded-xl w-48" key={key}>
                            {/* <Typography variant='caption'>Keyframe {parseInt(key) + 1}</Typography> */}
                            <img src={keyframesBase64[key]["imageBase64"]} alt={`Keyframe ${key + 1}`} style={{width:200, height:150, justifyContent:'center', objectFit:'cover'}}/>
                            <Typography variant="caption">
                                {numbertoTimeConverter(keyframesBase64[key]["filteredFrameIndexTimestamp"] + 1)}
                            </Typography>
                        </button>
                        ))}
                </div>
            </div>}
            <BottomBar/>
            </div>
        );
}

