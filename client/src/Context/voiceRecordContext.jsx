'use client'
import React, { createContext, useContext, useState, useRef } from 'react';
import { useAppContext } from './AppProvider'; // Import AppContext to access the socket
import axios from 'axios';

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
    const { socket, selectedChat, user } = useAppContext();  // Access socket and selectedChat from AppContext
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Start recording
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (e) => {
            audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            setAudioBlob(blob);
            setAudioUrl(URL.createObjectURL(blob));
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    };

    // Stop recording
    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    };

    // Send the voice message via socket
    const sendVoiceMessage = () => {
        if (audioUrl && socket) {
            socket.emit('send-voice-message', {
                roomId: selectedChat._id,
                senderId: user._id,
                audioUrl: audioUrl,
            });
        }
    };

    // Upload audio to the server (optional step if you want to save it to the backend)
    const uploadAudio = async (audioBlob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'message.wav');

        try {
            const response = await axios.post('http://localhost:5000/chat/upload-voice-message', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.audioUrl;
        } catch (error) {
            console.error("Error uploading audio:", error);
        }
    };

    return (
        <VoiceContext.Provider
            value={{
                isRecording,
                audioBlob,
                audioUrl,
                startRecording,
                stopRecording,
                sendVoiceMessage,
                uploadAudio,
            }}
        >
            {children}
        </VoiceContext.Provider>
    );
};

export const useVoiceContext = () => {
    return useContext(VoiceContext);
};
