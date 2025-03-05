'use client'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'
import { FaStop } from 'react-icons/fa'
import { IoMdRecording } from 'react-icons/io'

const VoiceRecord = ({ onRecordFinish }) => {
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState(null)
    const [audioUrl, setAudioUrl] = useState(null)
    const mediaRecorderRef = useRef()
    const audioChunksRef = useRef()
    const router = useRouter()

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        mediaRecorderRef.current.ondataavailable = (e) => {
            audioChunksRef.current.push(e.data)
        }
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
            setAudioBlob(blob)
            setAudioUrl(URL.createObjectURL(blob))
            onRecordFinish(blob)
        }
        mediaRecorderRef.current.start()
        setIsRecording(true)
    }

    const stopRecording = () => {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
    }

    onRecordFinish = (audioBlob) => {
        const formData = new FormData()
        formData.append('audio', audioBlob, 'message.wav')

        axios.post('http://localhost:5000/chat/upload-voice-message', formData , {
            headers: {'Content-Type' : 'multipart/form-data'}
        })
        .then((response) => {
            const audioUrl = response.data.audioUrl 
            router.push({pathname:'/chat/message/SingleChat',
                query:{ audioUrl : audioUrl }
            })
        })
        .catch((error) =>{
            console.error("Error uploading audio:", error)
        })
    }

    return (
        <div>
            <button onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? <FaStop /> : <IoMdRecording />}
            </button>
            {audioUrl && (
        <div>
          <h2>Preview your message:</h2>
          <audio controls src={audioUrl}></audio>
          <button onClick={onRecordFinish}>Send Voice Message</button>
        </div>
      )}
        </div>
    )
}

export default VoiceRecord