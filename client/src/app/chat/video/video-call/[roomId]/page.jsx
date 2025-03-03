'use client';
import { useAppContext } from '@/Context/AppProvider';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { FaPhone, FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const VideoCall = () => {
    const { socket, user } = useAppContext();
    const router = useRouter();
    const params = useParams();
    const roomId = params.roomId;
    const [stream, setStream] = useState(null);
    const [callStatus, setCallStatus] = useState('initializing'); // initializing, calling, connected, ended
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const myVideo = useRef(null);
    const userVideo = useRef(null);
    const peerRef = useRef(null);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
                socket.emit("join-room", roomId);
                setCallStatus('calling');
                // Listen for another user connecting to the room
                socket.on("user-connected", (userId) => {
                    console.log("User connected to room:", userId);
                    callUser(userId, currentStream);
                });
            })
            .catch((err) => {
                console.error("Error accessing media devices:", err);
                alert("Cannot access camera or microphone. Please check permissions.");
            });

        // Socket event listeners
        socket.on("offer", handleReceiveCall);
        socket.on("answer", handleAnswer);
        socket.on("ice-candidate", handleICECandidate);
        socket.on("call-declined", handleCallDeclined);
        socket.on("user-disconnected", handleUserDisconnected);

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            if (peerRef.current) {
                peerRef.current.destroy();
            }

            socket.off("user-connected");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");
            socket.off("call-declined");
            socket.off("user-disconnected");
        };
    }, [roomId, socket, user]);


    const callUser = (userId, mediaStream) => {
        console.log("Initiating call to user:", userId);

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: mediaStream
        });

        peer.on("signal", (data) => {
            console.log("Sending offer signal");
            socket.emit("offer", {
                userId: userId,
                signal: data,
                receiverId: userId
            });
        });

        peer.on("stream", (remoteStream) => {
            console.log("Received remote stream");
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
            setCallStatus('connected');
        });

        peer.on("error", (err) => {
            console.error("Peer connection error:", err);
            setCallStatus('ended');
        });

        peerRef.current = peer;
    };

    // Handle receiving a call
    const handleReceiveCall = ({ signal, receiverId }) => {
        console.log("Received call offer");

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            console.log("Sending answer signal");
            socket.emit("answer", {
                receiverId: receiverId,
                signal: data
            });
        });

        peer.on("stream", (remoteStream) => {
            console.log("Received remote stream");
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
            setCallStatus('connected');
        });

        peer.on("error", (err) => {
            console.error("Peer connection error:", err);
            setCallStatus('ended');
        });

        // Signal the peer with the offer data
        peer.signal(signal);
        peerRef.current = peer;
    };

    // Handle answer to our offer
    const handleAnswer = ({ signal }) => {
        console.log("Received answer signal");
        if (peerRef.current) {
            peerRef.current.signal(signal);
            setCallStatus('connected');
        }
    };

    // Handle ICE candidates
    const handleICECandidate = ({ candidate }) => {
        console.log("Received ICE candidate");
        if (peerRef.current) {
            peerRef.current.signal({ candidate });
        }
    };

    // Handle call being declined
    const handleCallDeclined = () => {
        console.log("Call was declined");
        setCallStatus('ended');
        alert("Call was declined");
        router.push("/chat/message/chatPage");
    };

    //   Handle the other user disconnecting
    const handleUserDisconnected = () => {
        console.log("User disconnected from call");
        setCallStatus('ended');
        toast.error("The other participant has left the call");
        endCall();
    };

    //Toggle audio
    const toggleAudio = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsAudioEnabled(!isAudioEnabled);
        }
    };

    //Toggle video
    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoEnabled(!isVideoEnabled);
        }
    };

    //End the call
    const endCall = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        if (peerRef.current) {
            peerRef.current.destroy();
        }

        socket.emit("leave-room", roomId);
        setCallStatus('ended');
        router.push("/chat/message/chatPage");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
            <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-700 text-white text-center">
                    <h2 className="text-xl font-bold">
                        {callStatus === 'initializing' && "Initializing Call..."}
                        {callStatus === 'calling' && "Calling..."}
                        {callStatus === 'connected' && "Connected"}
                        {callStatus === 'ended' && "Call Ended"}
                    </h2>
                </div>

                <div className="relative w-full h-96 bg-black">
                    {/* Remote video (full size) */}
                    <video
                        ref={userVideo}
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Local video (small picture-in-picture) */}
                    <div className="absolute bottom-4 right-4 w-1/4 h-1/4 border-2 border-white rounded-lg overflow-hidden">
                        <video
                            ref={myVideo}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-700 flex justify-center space-x-4">
                    <button
                        onClick={toggleAudio}
                        className={`p-3 rounded-full ${isAudioEnabled ? 'bg-blue-500' : 'bg-red-500'}`}
                    >
                        {isAudioEnabled ? <FaMicrophone size={20} color="white" /> : <FaMicrophoneSlash size={20} color="white" />}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-3 rounded-full ${isVideoEnabled ? 'bg-blue-500' : 'bg-red-500'}`}
                    >
                        {isVideoEnabled ? <FaVideo size={20} color="white" /> : <FaVideoSlash size={20} color="white" />}
                    </button>

                    <button
                        onClick={endCall}
                        className="p-3 rounded-full bg-red-500"
                    >
                        <FaPhoneSlash size={20} color="white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCall;