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
    <div className="">
      <h2>Video Call</h2>

      <input
        type="text"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="Enter User ID"
      />
      <button onClick={initiateCall}>Initiate call</button>

      <section>id: {socket?.id}</section>


      <div className='flex flex-row m-4'>
        <div>
          <h3>My Video</h3>
          <video ref={myVideo} autoPlay playsInline muted className='video_player' />
        </div>

        {(incominCallInfo.isSomeoneCalling && !callAccepted) &&
          <div>
            <button onClick={answerCall}>Answer call</button>
            <button>Decline call</button>
          </div>
        }

        {callAccepted &&
          <div>
            <h3>Peer Video</h3>
            <video ref={peerVideo} autoPlay playsInline className='video_player' />
          </div>
        }
      </div>
    </div>
  );
}

export default App;