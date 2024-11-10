import React, { useEffect, useRef } from 'react'
import './App.css';
import VideoCall from './Video';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Replace with server URL if deployed

function App() {
  // const myVideoRef = useRef();

  // useEffect(() => {
  //   getMediaPermission();

  //   const setUserStream = async () => {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  //     // setLocalStream(stream);
  //     myVideoRef.current.srcObject = stream;
  // }
  // })

  // const getMediaPermission = async () => {
  //   const cameraPermission = await navigator.permissions.query({ name: "camera" });
  //   const micPermission = await navigator.permissions.query({ name: 'microphone' });

  //   if (micPermission.state !== 'granted' && cameraPermission.state !== 'granted') {
  //     alert('need to allow camera/microphone to continue using skydial')
  //   }
  // }

  return (
    <div className="">

    <VideoCall socket={socket} />
    </div>
  );
}

export default App;
