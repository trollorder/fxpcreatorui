'use client';
import { Typography, Button, IconButton, Icon } from "@mui/material";
import { useRouter } from "next/navigation";
import  BottomBar from "./Components/BottomBar";
import TopBar from "./Components/TopBar";
import axios from "axios";
import { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("kelvin");
  const [password, setPassword] = useState("");
  const [videos, setVideos] = useState([]);
  const [keyframes, setKeyframes] = useState({});
  const [keyframesBase64, setKeyframesBase64] = useState({});
  const [isReady, setIsReady] = useState(false);
  console.log(process.env.backendUrl)
  async function getAllVideos(){
    await axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/list-videos?username=${username}`).then((res) => {
      setVideos(res.data.videos);
      const videoIds = res.data.videos.map((video) => video['s3ObjectKey']);
      for (const videoId of videoIds){
        getFirstKeyFrame(videoId);
      }
    });
  };

  async function getFirstKeyFrame(s3ObjectKey){
    await axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/get-keyframe-for-video-base64?username=${username}&s3ObjectKey=${s3ObjectKey}&keyframeIndex=${0}`).then((res) => {
      console.log(res.data);
      setKeyframesBase64({...keyframesBase64, s3ObjectKey: res.data.imageBase64})
    });
  }

  
  useEffect(() => {
    getAllVideos();
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center mobile-view bg-black">
      <TopBar />
      <IconButton onClick={() => router.push('/UploadVideo')} className="bg-white">
        <AddIcon/>
      </IconButton>
      <div className="flex flex-col w-full overflow-auto">
        <Typography variant='h4' style={{color:'white'}}>Videos</Typography>
        <div className="flex flex-col overflow-x-auto w-full">
          {
          videos.length>0 &&  videos.map((video) => (
                <div className="flex flex-col" key={video['s3ObjectKey']}> 
                  <Typography className=" basis-4"  variant='h6'style={{color:'white'}}>{video.videoName}</Typography>
                  <Button style={{color:'black', backgroundColor:'white'}} onClick={() => router.push(`/EditVideoDetails/${video['s3ObjectKey'].split('/').pop()}`)}>Edit Title</Button>
                </div>
              ))
          }
        </div>
      </div>

      <BottomBar />
    </main>
  );
}
