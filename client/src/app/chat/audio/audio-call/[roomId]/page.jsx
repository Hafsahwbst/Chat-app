'use client'
import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { useAppContext } from "@/Context/AppProvider";
import { useParams, useRouter } from "next/navigation";

const AudioCall = () => {
    const { user, selectedChat, socket } = useAppContext();
    const [stream, setStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callIncoming, setCallIncoming] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState(null);
    const [ringing, setRinging] = useState(false);
    const router = useRouter();
    const myAudio = useRef();
    const userAudio = useRef();
    const peerRef = useRef();
    
    const roomId = useParams()
    const receiverId = selectedChat?.users.find((el) => el._id !== user._id)?._id;
    
console.log(receiverId,">>>rece");
console.log(user,"user");
console.log(roomId,">>>Roomid");


    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((audioStream) => {
            setStream(audioStream);
            if (myAudio.current) myAudio.current.srcObject = audioStream;
        });

        // Handle incoming call
        socket.on("incomingCall", ({ from, signal }) => {
            setCallIncoming(true);
            setCaller(from);
            setCallerSignal(signal);
        });

        // Notify caller that call is ringing
        socket.on("callRinging", () => {
            setRinging(true);
        });

        // Handle call acceptance
        socket.on("callAccepted", ({ signal }) => {
            setCallAccepted(true);
            setRinging(false);
            peerRef.current.signal(signal);
            router.push(`/chat/audio/audio-call/${roomId}`);  // Navigate to call room
        });

    }, [user]);

    const callUser = () => {
        const peer = new SimplePeer({ initiator: true, trickle: false, stream });

        peer.on("signal", (signal) => {
            socket.emit("callUser", { receiverId, signalData: signal, from: user._id });
        });

        peer.on("stream", (userStream) => {
            if (userAudio.current) userAudio.current.srcObject = userStream;
        });

        peerRef.current = peer;
        setRinging(true);
    };

    const acceptCall = () => {
        setCallAccepted(true);
        setCallIncoming(false);

        const peer = new SimplePeer({ initiator: false, trickle: false, stream });

        peer.on("signal", (signal) => {
            socket.emit("acceptCall", { signal, to: caller });
        });

        peer.on("stream", (userStream) => {
            if (userAudio.current) userAudio.current.srcObject = userStream;
        });

        peer.signal(callerSignal);
        peerRef.current = peer;
        router.push(`/chat/audio/audio-call/${roomId}`);  // Navigate both users to call page
    };

    return (
        <div className="p-4 border rounded">
            <h2>Audio Call</h2>
            <audio ref={myAudio} autoPlay muted />
            <audio ref={userAudio} autoPlay />

            {ringing && !callAccepted && (
                <p>Ringing...</p>
            )}

            {!callAccepted && !ringing && (
                <button onClick={callUser} className="bg-blue-500 text-white p-2 rounded">
                    Call
                </button>
            )}

            {callIncoming && !callAccepted && (
                <div>
                    <p>Incoming Call...</p>
                    <button onClick={acceptCall} className="bg-green-500 text-white p-2 rounded">
                        Accept Call
                    </button>
                </div>
            )}

            {callAccepted && <p>Call in progress...</p>}
        </div>
    );
};

export default AudioCall;
