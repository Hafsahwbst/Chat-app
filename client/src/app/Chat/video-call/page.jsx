'use client';
import { useAppContext } from '@/Context/AppProvider';
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { io } from 'socket.io-client';

const socket = io("http://localhost:5000");

const Video = ({roomId}) => {
  const { user, loading, selectedChat } = useAppContext();

  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef();
  const [stream, setStream] = useState(null);

  // const [stream, setStream] = useState(null);
  // const [receivingCall, setReceivingCall] = useState(false);
  // const [caller, setCaller] = useState('');
  // const [callerSignal, setCallerSignal] = useState(null);
  // const [callAccepted, setCallAccepted] = useState(false);

  // const myVideo = useRef();
  // const userVideo = useRef();
  // const connectionRef = useRef();

  // Handle socket events only when socket is available
  // useEffect(() => {
  //   if (!socket) return;

  //   // Handle incoming call
  //   socket.on('callIncoming', (data) => {
  //     console.log('Received call:', data);
  //     setReceivingCall(true);
  //     setCaller(data.from);
  //     setCallerSignal(data.signal);  // Set the signal data from the server
  //   });

  //   // Cleanup listener when component unmounts
  //   return () => {
  //     socket.off('callIncoming');
  //   };
  // }, [socket]);

  // Handle getting user media
  // useEffect(() => {
  //   if (loading || !user) return;

  //   navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  //     .then((stream) => {
  //       setStream(stream);
  //       if (myVideo.current) {
  //         myVideo.current.srcObject = stream;
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error accessing media devices:', error);
  //     });
  // }, [loading, user]);

  // const callUser = (userToCallId) => {
  //   if (!userToCallId || !stream) return;

  //   if (!user || !user._id) {
  //     console.error("User or user._id is not defined");
  //     return;  
  //   }

  //   const peer = new Peer({
  //     initiator: true,
  //     trickle: false,   // Ensure trickle is disabled to send complete signal
  //     stream,
  //   });

  //   peer.on('signal', (signal) => {
  //     console.log("Signal object before emitting:", signal);  
  //     socket.emit('callUser', {
  //       userToCall: userToCallId,
  //       signalData: signal,
  //       from: user._id,
  //     });
  //   });

  //   peer.on('stream', (remoteStream) => {
  //     if (userVideo.current) {
  //       userVideo.current.srcObject = remoteStream;
  //     }
  //   });

  //   socket.on('callAccepted', (signal) => {
  //     setCallAccepted(true);
  //     peer.signal(signal);
  //   });

  //   connectionRef.current = peer;
  // };

  // const answerCall = () => {
  //   if (!callerSignal || !stream) return;

  //   setCallAccepted(true);
  //   const peer = new Peer({
  //     initiator: false,
  //     trickle: false,    // Ensure trickle is disabled to send complete signal
  //     stream,
  //   });

  //   peer.on('signal', (signal) => {
  //     socket.emit('answerCall', { signal, to: caller });
  //   });

  //   peer.on('stream', (remoteStream) => {
  //     if (userVideo.current) {
  //       userVideo.current.srcObject = remoteStream;
  //     }
  //   });

  //   peer.signal(callerSignal);
  //   connectionRef.current = peer;
  // };

  if (loading || !user) {
    return <div>Loading...</div>;
  }
  
  useEffect(() => {
    console.log("hellooooo")
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }

        socket.emit("join-room", roomId);
      });

    socket.on("user-connected", (userId) => {
      console.log("Helooo")
      callUser(userId, stream);
    });

    socket.on("offer", handleReceiveCall);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleICECandidate);

    // return () => {
    //   socket.off("user-connected");
    //   socket.off("offer");
    //   socket.off("answer");
    //   socket.off("ice-candidate");
    // };
  }, [socket, roomId]);
 const callUser=()=>{
  console.log("Calll>>>>>")
 }

 const handleReceiveCall = ({ signal, userId }) => {
  const peer = new Peer({
    initiator: false,
    trickle: false,
    stream,
  });

  peer.on("signal", (data) => {
    socket.emit("answer", { userId, signal: data });
  });

  peer.on("stream", (userStream) => {
    if (userVideo.current) {
      userVideo.current.srcObject = userStream;
    }
  });

  peer.signal(signal);
  peerRef.current = peer;
};

const handleAnswer = ({ signal }) => {
  peerRef.current.signal(signal);
};

const handleICECandidate = ({ candidate }) => {
  peerRef.current.signal(candidate);
};
  return (
    <>
    <div>
      <video ref={myVideo} autoPlay muted />
      <video ref={userVideo} autoPlay />
    </div>
    </>
    // <div className="flex flex-col items-center space-y-4">
    //   <video playsInline muted ref={myVideo} autoPlay className="w-1/2 h-auto" />
    //   {callAccepted && <video playsInline ref={userVideo} autoPlay className="w-1/2 h-auto" />}

    //   {receivingCall && !callAccepted ? (
    //     <button className="bg-green-500 text-white px-4 py-2 rounded-md" onClick={answerCall}>
    //       Answer Call
    //     </button>
    //   ) : (
    //     selectedChat && selectedChat?.users && selectedChat.users.map((chatUser) =>
    //       chatUser._id !== user._id ? (
    //         <button
    //           key={chatUser._id}
    //           className="bg-blue-500 text-white px-4 py-2 rounded-md"
    //           onClick={() => callUser(chatUser._id)}  // Pass the user._id
    //         >
    //           Call {chatUser.username}
    //         </button>
    //       ) : null
    //     )
    //   )}
    // </div>
  );
};

export default Video;
