// utils/callUser.js

import Peer from "simple-peer";

const callUser = (userId, mediaStream,peerRef, socket, setCallStatus, setRemoteStream, userVideo) => {
    if (!userId || !mediaStream) {
        console.error(" callUser: Missing userId or mediaStream", { userId, mediaStream });
        return;
    }

    console.log("Calling user:", userId);

    const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: mediaStream
    });

    peer.on("signal", (data) => {
        console.log(" Sending offer signal to:", userId);
        socket.emit("offer", {
            userId,
            signal: data,
            receiverId: userId
        });
    });

    peer.on("stream", (remoteStream) => {
        console.log("🎥 Received remote stream from:", userId);
        setRemoteStream(remoteStream);
        if (userVideo.current) {
            userVideo.current.srcObject = remoteStream;
        }
        setCallStatus("connected");
    });

    peer.on("error", (err) => {
        console.error("🚨 Peer connection error:", err);
        setCallStatus("ended");
    });

    peerRef.current = peer;
};

export default callUser;
