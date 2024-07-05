'use client';
import { Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import  BottomBar from "./Components/BottomBar";
import TopBar from "./Components/TopBar";
import axios from "axios";
import { useEffect, useState } from "react";

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
    <main className="flex min-h-screen flex-col items-center justify-between mobile-view bg-white text-black">
      <TopBar />
      {
       videos.length>0 &&  videos.map((video) => (
            <div className="flex flex-col items-center justify-center w-full" key={video['s3ObjectKey']}> 
              <Typography>{video.videoName}</Typography>
              <Button onClick={() => router.push(`/EditVideoDetails/${video['s3ObjectKey'].split('/').pop()}`)}>Edit Title</Button>
            </div>
          ))
      }
      {
        keyframesBase64.length>0 && Object.keys(keyframesBase64).map((key) => (
          <img src={`${keyframesBase64[key]}`} alt="keyframe" />
        ))
      }
      <BottomBar />
    </main>
  );
}
