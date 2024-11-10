// client/src/components/VideoCall.js
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

// const socket = io('http://localhost:4000'); // Replace with server URL if deployed

const VideoCall = ({ socket }) => {

    const connectionRef = useRef();
    const [stream, setStream] = useState(null);
    const [userId, setUserId] = useState('');

    const [callAccepted, setCallAccepted] = useState(false);

    const [incominCallInfo, setIncominCallInfo] = useState({})

    const myVideo = useRef();
    const peerVideo = useRef();

    useEffect(() => {
        // Get media stream
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((mediaStream) => {
                setStream(mediaStream);
                myVideo.current.srcObject = mediaStream;
            }).catch((error) => console.error('Error accessing media devices:', error));

        console.log('socket.id', socket)

        // socket.on('user-joined', (userId) => {
        //     initializePeer(userId, false);
        // });

        socket.on('incomingCall', ({ from, signalData }) => {
            setIncominCallInfo({ isSomeoneCalling: true, from, signalData });
        });
    }, []);

    // Initialize SimplePeer
    const initializePeer = (userId, initiator) => {
        const peer = new SimplePeer({
            initiator,
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
    };

    const initiateCall = () => {
        if (userId) {
            initializePeer(userId, true);
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

    // const endCall = () => {
    //     connectionRef.current.destroy();
    //     window.location.reload();
    // }

    return (
        <div>
            <h2>One-to-One Video Call</h2>
            <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
            />
            <button onClick={initiateCall}>Initiate call</button>


            <div className='flex flex-row flex-col'>
                <div>
                    <h3>My Video</h3>
                    <video ref={myVideo} autoPlay playsInline muted className='video_player' />
                </div>

                {
                    incominCallInfo.isSomeoneCalling &&
                    <div>
                        <button onClick={answerCall}>Answer call</button>
                        <button>Decline call</button>
                    </div>
                }

                <div>
                    <h3>Peer Video</h3>
                    <video ref={peerVideo} autoPlay playsInline className='video_player' />
                </div>

            </div>
        </div>
    );
};

export default VideoCall;
