'use client';
import { Typography, Button, IconButton, Icon } from "@mui/material";
import { useRouter } from "next/navigation";
import  BottomBar from "./Components/BottomBar";
import TopBar from "./Components/TopBar";
import axios from "axios";
import { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { ClipLoader } from "react-spinners";
import { Cancel, Delete } from "@mui/icons-material";
import EditIcon from '@mui/icons-material/Edit';
import ConfirmDelete from "./Components/ConfirmDelete";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("kelvin");
  const [videos, setVideos] = useState([]);
  const [keyframesBase64, setKeyframesBase64] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [s3ObjectKey, setS3ObjectKey] = useState(null);

  function getAllVideos(){
    return new Promise((resolve, reject) => {
      axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/list-videos?username=${username}`).then(async (res) => {
        const videos = res.data.videos;
        const keyframesPromises = videos.map((videoDict) => {
          return axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/get-keyframe-for-video-base64?username=${username}&s3ObjectKey=${videoDict['s3ObjectKey']}&keyframeIndex=0`).then((res) => {
            return { [videoDict['s3ObjectKey']]: res.data };
          });
        });
        const keyframes = await Promise.all(keyframesPromises);
        const keyframesDict = Object.assign({}, ...keyframes);
        setVideos(videos);
        setKeyframesBase64(keyframesDict);
        setIsReady(true);
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  };

  function handleDelete(s3ObjectKey){
    axios.delete(`${process.env.NEXT_PUBLIC_backendUrl}/delete-video?username=${username}&videoS3ObjectKey=${s3ObjectKey}`).then((res) => {
      console.log(res.data);
      getAllVideos();
      setIsDeleteDialogOpen(false);
    }
    )
  }

  
  useEffect(() => {
    getAllVideos();
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center mobile-view bg-black px-10 pb-20 pt-2">
      <div className="flex justify-items-end ">
        <IconButton>
          <Cancel style={{color:'#ff0050', backgroundColor:'white', fontSize:'40px'}} className="rounded-full"/>
        </IconButton>
        <Typography variant='body1' style={{color:'black', backgroundColor:'white'}} className=" p-4 font-bold rounded-2xl">Accessibility Mode</Typography>
      </div>
      {/* <Typography variant='body2' style={{color:'white'}}>Welcome, {username}</Typography> */}

      {!isReady && keyframesBase64?
        <ClipLoader color='white' loading={!isReady} size={150} css={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}/>
      : <div className="flex flex-col w-full overflow-auto">
        <Typography className=" border-b-2" variant='h6' style={{color:'white', fontWeight:'bold'}}>Select an Uploaded Video To Edit</Typography>
        
        <div className="flex flex-col overflow-x-auto w-full">
          {
          videos.length>0 &&  videos.map((video) => (
                <div className="flex w-full justify-center items-center" key={video['s3ObjectKey']}> 
                  <div className="flex flex-col overflow-auto justify-center w-1/2">
                    <Typography className=" w-2/3 pl-2"  variant='caption'style={{color:'white',fontSize:'1rem' , fontWeight:'bolder'}}>{video.videoName}</Typography>
                    <img  src={keyframesBase64[video['s3ObjectKey']]['imageBase64']} className="w-40 h-40 rounded-2xl"/>
                  </div>
                  <div className="flex w-1/2 justify-center items-center gap-4 mt-2">
                    <IconButton style={{backgroundColor:'white', width:'2em', height:'2em'}} onClick={() => router.push(`/EditVideoDetails/${video['s3ObjectKey'].split('/').pop()}`)}><EditIcon style={{color:'#00f2ea'}}/></IconButton>
                    <IconButton style={{backgroundColor:'white', width:'2em', height:'2em'}} onClick={() => {setS3ObjectKey(video['s3ObjectKey']) ; setIsDeleteDialogOpen(true)}}><Delete style={{color:'#ff0050', fontSize:'30px'}}/></IconButton>
                  </div>
                </div>
              ))
          }
        </div>
      </div>}
      <ConfirmDelete show={isDeleteDialogOpen} onCancel={() => setIsDeleteDialogOpen(false)} onDelete={() => handleDelete(s3ObjectKey)} />

      <BottomBar />
    </main>
  );
}
