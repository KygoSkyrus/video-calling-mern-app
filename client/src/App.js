import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import './App.css';

const socket = io('http://localhost:4000'); // server URL

function App() {

  const myVideo = useRef();
  const peerVideo = useRef();
  const connectionRef = useRef();

  const [stream, setStream] = useState(null);
  const [userId, setUserId] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [incominCallInfo, setIncominCallInfo] = useState({})


  useEffect(() => {
    // Get media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        myVideo.current.srcObject = mediaStream;
      }).catch((error) => console.error('Error accessing media devices:', error));

    console.log('id', socket.id)

    socket.on('incomingCall', ({ from, signalData }) => {
      setIncominCallInfo({ isSomeoneCalling: true, from, signalData });
    });
  }, []);

  const initiateCall = () => {
    if (userId) {
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
      });

      peer.on('signal', (signalData) => {
        console.log('signal on peer', userId, signalData, socket.id)
        socket.emit('initiateCall', { userId, signalData, myId: socket.id }); //initiating call
      });

      peer.on('stream', (remoteStream) => {
        console.log('stream on peer', remoteStream)
        peerVideo.current.srcObject = remoteStream;
      });

      socket.on('callAccepted', (signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });

      connectionRef.current = peer;
    } else {
      alert('enter user id call initiate a call')
    }
  };

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new SimplePeer({ initiator: false, trickle: false, stream: stream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: incominCallInfo.from });
    });

    peer.on('stream', (currentStream) => {
      peerVideo.current.srcObject = currentStream;
    });

    peer.signal(incominCallInfo.signalData);

    connectionRef.current = peer;
  }

  const endCall = () => {
    connectionRef.current.destroy();
    window.location.reload();
  }

  return (
    <div className="flex flex-col item-center">
      <h2 className='text-center'>Video Calling MERN App</h2>

      <div className='flex flex-col w-300 gap-4'>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
          className='input'
        />
        <button onClick={initiateCall} className='input bg-blue'>Call user</button>
      </div>

      <section className='m-4'>My ID: <b><u><i>ewrh8328rn8oe23d21j{socket?.id}</i></u></b></section>

      <div className='flex flex-row gap-4 m-4 mb-8'>
        <div>
          <h3 className='text-center'>My Video</h3>
          <video ref={myVideo} autoPlay playsInline muted className='video_player' />
        </div>
        
        {callAccepted &&
          <div>
            <h3 className='text-center'>Peer Video</h3>
            <video ref={peerVideo} autoPlay playsInline className='video_player' />
          </div>
        }
      </div>

      {callAccepted ?
        <button className='input bg-red' onClick={endCall}>End Call</button>
        :
        (incominCallInfo.isSomeoneCalling) &&
        <div className='mb-8'>
          <section>{setIncominCallInfo.from} is calling</section>
          <button onClick={answerCall} className='input bg-green'>Answer call</button>
        </div>
      }
    </div>
  );
}

export default App;