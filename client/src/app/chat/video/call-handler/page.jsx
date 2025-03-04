'use client';
import { useAppContext } from "@/Context/AppProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaPhone, FaPhoneSlash, FaUser } from "react-icons/fa";

const IncomingCall = ({ isOpen, closeModal }) => {
    const { socket, user } = useAppContext();
    const router = useRouter();
    const [callerInfo, setCallerInfo] = useState(null);
    const [callType, setCallType] = useState(null);

    useEffect(() => {
        if (!socket || !user) {
            return;
        }

        // Join user's personal room to receive calls
        socket.emit("join-room", user._id);
        console.log("Joined personal room:", user._id);

        // Handle incoming calls
        const handleIncomingCall = (data) => {
            console.log("Incoming call received:", data);
            if (data && data.caller) {
                setCallerInfo(data.caller);
                setCallType(data.callType);
                closeModal(true); // Open the modal
            } else {
                console.error("Invalid caller data received:", data);
            }
        };

        socket.on("incoming-call", handleIncomingCall);

        return () => {
            socket.off("incoming-call", handleIncomingCall);
        };
    }, [socket, user, closeModal]);

    const acceptCall = () => {
        if (!callerInfo || !user) {
            console.log("Missing caller info or user data");
            return;
        }

        console.log("Accepting call from:", callerInfo);

        // Let the caller know the call was accepted
        socket.emit("call-accepted", {
            callerId: callerInfo.id,
            accepterId: user._id,
            roomId: callerInfo.roomId
        });

        closeModal(false);

        const roomId = callerInfo.roomId;
        console.log("Navigating to call room:", roomId, "Call type:", callType);

        if (roomId) {
            // Navigate to the appropriate call page
            if (callType === 'video') {
                router.push(`/chat/video/video-call/${roomId}`);
            } else {
                router.push(`/chat/audio/audio-call/${roomId}`);
            }
        } else {
            console.error("No roomId found in caller info");
        }
    };

    const declineCall = () => {
        if (!callerInfo) {
            console.error("Missing caller info");
            return;
        }

        console.log("Declining call from:", callerInfo.id);

        socket.emit("call-declined", {
            userId: callerInfo.id,
            roomId: callerInfo.roomId
        });

        closeModal(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center  z-50">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black  opacity-50"></div>

            {/* Modal */}
            <div className="relative z-10 bg-white rounded-lg shadow-lg overflow-hidden w-full h-full  md:w-2/3 md:h-auto">
                <div className="p-4 bg-blue-600 text-white text-center">
                    <h2 className="text-2xl font-bold">Incoming {callType === 'video' ? 'Video' : 'Voice'} Call</h2>
                </div>

                <div className="p-6 flex flex-col items-center justify-between h-full">
                    <div className="flex items-center mt-28  flex-col"> 
                        <div className="w-32 h-32 mb-8 rounded-full bg-gray-200 flex items-center justify-center ">
                        {/* <img  size={80} className="text-gray-500" src={callerInfo.avatar && `http://localhost:5000/${callerInfo.avatar}`} alt="" /> */}
                        <FaUser size={52} className="text-gray-500" />
                    </div>

                        <p className="text-4xl capitalize font-semibold mb-1">
                            {callerInfo?.username || "Unknown User"}
                        </p>

                        <p className="text-2xl text-gray-500 mb-24"> calling you...</p>
                    </div>
                    <div>
                        <div className="flex space-x-40 mb-40">
                            <div>
                                <button
                                    onClick={declineCall}
                                    className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition"
                                    aria-label="Decline call"
                                >
                                    <FaPhoneSlash size={40} color="white" />
                                </button>
                                <p>Decline</p>
                            </div>
                            <div>
                                <button
                                    onClick={acceptCall}
                                    className="p-3 rounded-full bg-green-500 hover:bg-green-600 transition"
                                    aria-label="Accept call"
                                >
                                    <FaPhone size={40} color="white" />
                                </button>
                                <p>Accept</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCall;