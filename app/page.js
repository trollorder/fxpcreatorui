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
  console.log(process.env.backendUrl)
  async function getAllVideos(){
    await axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/list-videos?username=${username}`).then((res) => {
      setVideos(res.data.videos);
      console.log(res.data.videos)
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        getFirstKeyFrame(video['s3ObjectKey']).then((res) => {
          setKeyframes({...keyframes, [video['s3ObjectKey']]: res.data['imageBase64']});
          console.log(keyframes);
        });
      }
      
    });
  };

  
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
              <Button onClick={router.push('/EditVideoDetails')}>Edit Title</Button>
            </div>
          ))
      }
      {keyframes.length>0 && keyframes.map((keyframe) => (
        <div className="flex flex-col items-center justify-center w-full" key={keyframe['s3ObjectKey']+'keyframe'}> 
          <img src={keyframe['keyframe']} />
        </div>
      ))}
      <BottomBar />
    </main>
  );
}
