import { useAppContext } from '@/Context/AppProvider' 
import React, { useEffect, useRef, useState } from 'react'

const Audio = () => {
    const { user, socket , selectedChat } = useAppContext()
    const [isCalling, setIsCalling] = useState(false)
    const [callReceiever, setCallReceiever] = useState('')
    const [callStatus, setCallStatus] = useState('')

    const receiver = selectedChat.users.find(el => el._id !== user._id);
    const receiverId = receiver ? receiver._id : null; 
   
        
    useEffect(() => {
        const handleUserConnected = (userId) => {
            console.log("User connected to room:", userId);
        };
        socket.on("user-connected", handleUserConnected);
        return () => {
            socket.off("user-connected", handleUserConnected);
        };
    }, [socket]); 

    const initiateCall = () => {
        console.log("Initiating call to:", user._id || callReceiever);
        socket.emit('initiate-call', { callReceiever:receiverId ,  userId : user._id } || null)
        setIsCalling(true)
        setCallStatus('Calling...')
    }
    
    const handleCallButtonClick = () => {
        initiateCall();
    };
    
    return (
        <div>
            <h2>Audio Call</h2>
            <button 
                className='btn' 
                onClick={handleCallButtonClick} 
                disabled={isCalling}
            >
                Call
            </button>
            {callStatus &&
                <p>Status: {callStatus}</p>
            }
        </div>
    )
}

export default Audio