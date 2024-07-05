'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
const Page = () => {
    const router = useRouter();
    const [username, setUsername] = useState("kelvin");
    const [s3ObjectKeyNoVideo,setS3ObjectKeyNoVideo] = useState(null);
    const [keyframeIndex, setKeyframeIndex] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const videoIdAndIndex = window.location.pathname.split('/').pop();
            const videoId = videoIdAndIndex.split('?')[0];
            setS3ObjectKeyNoVideo(videoId);
            const index = videoIdAndIndex.split('keyframeIndex')[1]
            console.log(videoIdAndIndex)
            setKeyframeIndex(index);
            console.log(index)
            console.log(videoId)
        }
    }, []);
    return (
        <div>
            <h1>Hello, Next.js!</h1>
            <p>Welcome to your new page.</p>
        </div>
    );
};

export default Page;