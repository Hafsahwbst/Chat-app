const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }, // Free Google STUN Server
      {
        urls: "turn:your-turn-server.com:3478",
        username: "your-username",
        credential: "your-password",
      },
    ],
  };
  
  export default rtcConfig;
  