'use client'
import React, { useState, useEffect } from 'react';
import { RiStopMiniFill } from "react-icons/ri";
import { BiSolidSend } from "react-icons/bi";

import { AiFillAudio } from "react-icons/ai";
const VoiceRecorder = ({ onSend }) => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [error, setError] = useState(null); // For displaying errors
    let mediaRecorder;
    let audioChunks = [];
  
    // Function to start recording
    const startRecording = () => {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Browser does not support microphone access.");
        console.error("Browser does not support microphone access.");
        return;
      }
  
      // Request microphone access
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          // Successfully got microphone access
          console.log("Microphone access granted");
          
          // Initialize mediaRecorder
          mediaRecorder = new MediaRecorder(stream);
  
          // Collect audio data as it's recorded
          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };
  
          // When recording stops, create a blob of the audio
          mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/wav' });
            setAudioBlob(blob);
          };
  
          // Start recording
          mediaRecorder.start();
          setRecording(true);
          setError(null); // Clear any previous error messages
          console.log("Recording started");
        })
        .catch((err) => {
          // Handle errors, such as permission denial
          setError("Failed to access microphone: " + err.message);
          console.error("Error accessing microphone", err);
        });
    };
  
    // Function to stop recording
    const stopRecording = () => {
      // Only stop recording if mediaRecorder exists and is active
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        setRecording(false);
        console.log("Recording stopped");
      } else {
        setError("Recorder was not initialized or not in a recording state.");
        console.error("Recorder was not initialized or not in a recording state.");
      }
    };
  
    // Function to send audio to the parent component
    const sendAudio = () => {
      if (audioBlob) {
        onSend(audioBlob); // Send the audio blob to the parent
      } else {
        setError("No audio recorded to send.");
        console.error("No audio recorded to send.");
      }
    };
  
    // Automatically send audio when recording is finished (optional)
    useEffect(() => {
      if (audioBlob) {
        sendAudio();
      }
    }, [audioBlob]);

  return (
    <div>
      <div className='text-end my-3'>
        {error && <p className="error-text text-red-300 mb-2">{error}</p>} 
        {!recording ? (
          <button onClick={startRecording}><AiFillAudio  className='bg-white text-4xl rounded-full'/></button>
        ) : (
          <button onClick={stopRecording}><RiStopMiniFill className='bg-white text-4xl rounded-full' /></button>
        )}
          {/* Display send audio button if recording is finished */}
        {audioBlob && <button onClick={sendAudio}><BiSolidSend className='bg-white text-4xl rounded-full' />
        </button>}
      </div>
    </div>
  );
};

export default VoiceRecorder;
