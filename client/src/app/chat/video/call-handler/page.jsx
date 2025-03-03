'use client';
import { useAppContext } from "@/Context/AppProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaPhone, FaPhoneSlash, FaUser } from "react-icons/fa";

const IncomingCall = ({ isOpen, closeModal }) => {
    const { socket, user } = useAppContext();
    const router = useRouter();
    const [callerInfo, setCallerInfo] = useState(null);

    useEffect(() => {
        if (!socket || !user) {
            return;
        }
        socket.emit("join-room", user._id);

        // Handle incoming calls
        const handleIncomingCall = (data) => {
            console.log("Incoming call received:", data);
            if (data && data.caller) {
                setCallerInfo(data.caller);
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
            console.error("Missing caller info or user data");
            return;
        }

        console.log("Accepting call from:", callerInfo);

        socket.emit("call-accepted", {
            callerId: callerInfo.id,
            accepterId: user._id
        });

        closeModal(false);

        const roomId = callerInfo.roomId;
        if (roomId) {
            router.push(`/chat/video/video-call/${roomId}`);
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
            userId: callerInfo.id
        });

        closeModal(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black opacity-50"></div>

            {/* Modal */}
            <div className="relative z-10 bg-white rounded-lg shadow-lg overflow-hidden w-80">
                <div className="p-4 bg-blue-600 text-white text-center">
                    <h2 className="text-xl font-bold">Incoming Call</h2>
                </div>

                <div className="p-6 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                        <FaUser size={40} className="text-gray-500" />
                    </div>

                    <p className="text-lg font-semibold mb-1">
                        {callerInfo?.username || "Unknown User"}
                    </p>

                    <p className="text-sm text-gray-500 mb-6">is calling you...</p>

                    <div className="flex space-x-4">
                        <button
                            onClick={declineCall}
                            className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition"
                        >
                            <FaPhoneSlash size={24} color="white" />
                        </button>

                        <button
                            onClick={acceptCall}
                            className="p-3 rounded-full bg-green-500 hover:bg-green-600 transition"
                        >
                            <FaPhone size={24} color="white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCall;