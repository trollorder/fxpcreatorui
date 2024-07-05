'use client';
import { Typography, Button, IconButton, Icon } from "@mui/material";
import { useRouter } from "next/navigation";
import  BottomBar from "./Components/BottomBar";
import TopBar from "./Components/TopBar";
import axios from "axios";
import { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { ClipLoader } from "react-spinners";
import { Delete } from "@mui/icons-material";
export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("kelvin");
  const [videos, setVideos] = useState([]);
  const [keyframesBase64, setKeyframesBase64] = useState(null);
  const [isReady, setIsReady] = useState(false);
  async function getAllVideos(){
    await axios.get(`${process.env.NEXT_PUBLIC_backendUrl}/list-videos?username=${username}`).then(async (res) => {
      setVideos(res.data.videos);      
    });
  };

  function handleDelete(s3ObjectKey){
    axios.delete(`${process.env.NEXT_PUBLIC_backendUrl}/delete-video?username=${username}&videoS3ObjectKey=${s3ObjectKey}`).then((res) => {
      console.log(res.data);
      getAllVideos();
    }
    )
  }

  
  useEffect(() => {
    getAllVideos();
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center mobile-view bg-black p-10">
      <TopBar />
      <Typography variant='h5' style={{color:'white'}}>Accessibility Mode</Typography>
      <Typography variant='body2' style={{color:'white'}}>Welcome, {username}</Typography>

      {!isReady && keyframesBase64?
        <ClipLoader color='white' loading={!isReady} size={150} css={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}/>
      : <div className="flex flex-col w-full overflow-auto">
        <Typography variant='h4' style={{color:'white'}}>Videos</Typography>
        <div className="flex flex-col overflow-x-auto w-full">
          {
          videos.length>0 &&  videos.map((video) => (
                <div className="flex flex-col" key={video['s3ObjectKey']}> 
                  <Typography className=" basis-4"  variant='h6'style={{color:'white'}}>{video.videoName}</Typography>
                  {/* <img src={keyframesBase64[video['s3ObjectKey']]['imageBase64']} className="w-40 h-40"/> */}
                  <div className="flex w-full">
                    <Button style={{color:'black', backgroundColor:'white', fontWeight:'bolder'}} onClick={() => router.push(`/EditVideoDetails/${video['s3ObjectKey'].split('/').pop()}`)}>Edit Video Details</Button>
                    <IconButton onClick={() => handleDelete(video['s3ObjectKey'])}><Delete style={{color:'red', backgroundColor:'white'}}/></IconButton>
                  </div>
                </div>
              ))
          }
        </div>
      </div>}

      <BottomBar />
    </main>
  );
}
