'use client';
import { useAppContext } from '@/Context/AppProvider';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone } from 'react-icons/fa';
import toast from 'react-hot-toast';

const VideoCall = () => {
    const { socket, user } = useAppContext();
    const router = useRouter();
    const { roomId } = useParams();

    const [stream, setStream] = useState(null);
    const [callStatus, setCallStatus] = useState('connecting');
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [remoteStream, setRemoteStream] = useState(null);
    const myVideo = useRef(null);
    const userVideo = useRef(null);
    const peerRef = useRef(null);

    useEffect(() => {
        if (!socket || !user || !roomId) return;

        console.log("Initializing Video Call...");

        // Get the local media stream
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                console.log("Local stream obtained.");
                setStream(currentStream);

                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }

                // Join the room
                socket.emit("join-room", roomId);

                socket.on("user-connected", (userId) => {
                    console.log("User connected:", userId);
                    if (currentStream) {
                        connectUser(userId, currentStream); // Establish connection with the other user
                    } else {
                        console.warn("Stream not available when connecting to user!");
                    }
                });

                socket.on("user-disconnected", handleUserDisconnected); // Handle user disconnection
                socket.on("ice-candidate", handleICECandidate); // Handle ICE candidates for WebRTC
            })
            .catch(err => console.error("Error accessing media devices:", err));

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (peerRef.current) {
                peerRef.current.destroy();
            }

            socket.off("user-connected");
            socket.off("user-disconnected");
            socket.off("ice-candidate");
        };
    }, [roomId, socket, user]);

    const connectUser = (userId, mediaStream) => {
        if (!userId || !mediaStream) {
            console.error("Missing userId or mediaStream", { userId, mediaStream });
            return;
        }

        console.log("Connecting to new user:", userId);

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: mediaStream
        });

        peer.on("signal", (data) => {
            console.log("Sending offer signal to:", userId);
            socket.emit("offer", {
                userId,
                signal: data,
                receiverId: userId
            });
        });

        peer.on("stream", (remoteStream) => {
            console.log("Received remote stream from:", userId);
            setRemoteStream(remoteStream);
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
            setCallStatus("connected");
        });

        peer.on("error", (err) => {
            console.error("Peer connection error:", err);
            setCallStatus("ended");
        });

        peerRef.current = peer;
    };

    const handleICECandidate = ({ candidate }) => {
        console.log("Received ICE candidate");
        if (peerRef.current) {
            peerRef.current.signal({ candidate });
        }
    };

    const handleUserDisconnected = () => {
        console.log("User disconnected from call");
        setCallStatus("ended");
        toast.error("The other participant has left the call");
        endCall();
    };

    // Toggle microphone
    const toggleMicrophone = () => {
        if (stream) {
            const audioTracks = stream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsAudioEnabled(!isAudioEnabled);
        }
    };

    // Toggle video
    const toggleVideo = () => {
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoEnabled(!isVideoEnabled);
        }
    };

    const endCall = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (peerRef.current) {
            peerRef.current.destroy();
        }
        socket.emit("leave-room", roomId);
        setCallStatus("ended");
        router.push("/chat/message/chatPage");
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Status indicator */}
            <div className="bg-blue-600 text-white p-2 text-center">
                {callStatus === 'connecting' && "Connecting..."}
                {callStatus === 'connected' && "Connected"}
                {callStatus === 'ended' && "Call Ended"}
            </div>

            {/* Video container */}
            <div className="flex-1 flex flex-col md:flex-row p-4 relative">
                {/* Remote video (main display) */}
                <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
                    <video
                        ref={userVideo}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                    />

                    {!remoteStream && callStatus === 'connecting' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-xl">Waiting for other participant...</div>
                        </div>
                    )}
                </div>

                {/* Local video (picture-in-picture) */}
                <div className="absolute bottom-8 right-8 w-1/4 max-w-xs bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                    <video
                        ref={myVideo}
                        className="w-full object-cover"
                        autoPlay
                        playsInline
                        muted
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 p-4 flex justify-center items-center space-x-6">
                <button
                    onClick={toggleMicrophone}
                    className={`p-4 rounded-full ${isAudioEnabled ? 'bg-gray-500' : 'bg-blue-500'} hover:opacity-80 transition`}
                    aria-label={isAudioEnabled ? "Unmute microphone" : "Mute microphone"}
                >
                    {isAudioEnabled ? <FaMicrophoneSlash size={24} /> : <FaMicrophone size={24} />}
                </button>

                <button
                    onClick={endCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition"
                    aria-label="End call"
                >
                    <FaPhone size={24} />
                </button>

                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full ${isVideoEnabled ? 'bg-gray-500' : 'bg-blue-500'} hover:opacity-80 transition`}
                    aria-label={isVideoEnabled ? "Turn video on" : "Turn video off"}
                >
                    {isVideoEnabled ? <FaVideoSlash size={24} /> : <FaVideo size={24} />}
                </button>
            </div>
        </div>
    );
};

export default VideoCall;
