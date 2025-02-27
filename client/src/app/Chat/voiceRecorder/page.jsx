'use client';
import React, { useState, useEffect } from 'react';
import { RiStopMiniFill } from "react-icons/ri";
import { BiSolidSend } from "react-icons/bi";
import { AiFillAudio } from "react-icons/ai";

const VoiceRecorder = ({ onSend }) => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null); // Store mediaRecorder in state
    const [error, setError] = useState(null);
    let audioChunks = [];

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder); // Store the recorder instance

            recorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/wav' });
                setAudioBlob(blob);
            };

            recorder.start();
            setRecording(true);
            setError(null);
        } catch (err) {
            setError("Failed to access microphone: " + err.message);
            console.error("Error accessing microphone", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setRecording(false);
        } else {
            setError("Recorder was not initialized or not in a recording state.");
            console.error("Recorder was not initialized or not in a recording state.");
        }
    };

    const sendAudio = () => {
        if (audioBlob) {
            onSend(audioBlob);
        } else {
            setError("No audio recorded to send.");
        }
    };

    return (
        <div>
            <div className='text-end my-3'>
                {error && <p className="error-text text-red-300 mb-2">{error}</p>}
                {!recording ? (
                    <button onClick={startRecording}><AiFillAudio className='bg-white text-4xl rounded-full' /></button>
                ) : (
                    <button onClick={stopRecording}><RiStopMiniFill className='bg-white text-4xl rounded-full' /></button>
                )}
                {audioBlob && <button onClick={sendAudio}><BiSolidSend className='bg-white text-4xl rounded-full' /></button>}
            </div>
        </div>
    );
};

export default VoiceRecorder;
