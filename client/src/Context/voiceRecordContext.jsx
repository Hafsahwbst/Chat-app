import React, { useContext, useState } from 'react';

const voiceContext = useContext()

export const VoiceProvider = ({ onSend, children }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    let mediaRecorder;
    let audioChunks = [];

    const startRecording = () => {
        setIsRecording(true);
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudioUrl(audioUrl);
                    onSend(audioBlob); // Send the audio file to the backend
                };
                mediaRecorder.start();
            });
    };

    const stopRecording = () => {
        setIsRecording(false);
        mediaRecorder.stop();
    };

    return (
        <voiceContext.Provider value={{ isRecording, setIsRecording, audioUrl, setAudioUrl }}>
            {children}
        </voiceContext.Provider>
    )
}

export const useVoiceContext = () => { 
  return useContext(voiceContext);
};


