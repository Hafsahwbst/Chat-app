'use client';
import { getSender, getSenderFull } from '@/app/config/ChatLogics/page';
import UpdateGroupChatModal from '@/app/miscelleneous/UpdateGroupChatModal';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaVideo } from 'react-icons/fa';
import ScrollableChats from '../ScrollableChats/page';
import Profilemodal from '@/app/miscelleneous/profileModal';
import axios from 'axios';
import { useAppContext } from '@/Context/AppProvider';
import { useRouter } from 'next/navigation';
import Audio from '../../audio/audio-call/page';

var selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, setSelectedChat, notification, setNotification, user, socket } = useAppContext();
  const [message, setmessage] = useState([]);
  const [loading, setloading] = useState(false);
  const [newMessage, setnewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const router = useRouter();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setloading(true);
      const { data } = await axios.get(`http://localhost:5000/fetch-message/${selectedChat._id}`, {
        withCredentials: true
      });
      setmessage(data);
      setloading(false);
      socket.emit('join-room', selectedChat._id);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to Load the Messages');
      setloading(false);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === 'Enter' && newMessage) {
      socket.emit('stop typing', selectedChat._id);
      try {
        setnewMessage('');
        const { data } = await axios.post('http://localhost:5000/message', {
          content: newMessage,
          chatId: selectedChat._id,
        }, { withCredentials: true });

        socket.emit('new message', data);
        setmessage((prevMessages) => [...prevMessages, data]);
      } catch (error) {
        toast.error('Failed to send message');
      }
    }
  };

  useEffect(() => {
    if (!socket) {
      console.error('Socket not initialized!');
      return;
    }

    if (user) {
      socket.on('typing', () => setIsTyping(true));
      socket.on('stop typing', () => setIsTyping(false));
    }
    return () => {
      socket.off('connected');
      socket.off('typing');
      socket.off('stop typing');
    };
  }, [user]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on('message received', (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
        }
      } else {
        setmessage((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    });
  });

  // Video call functionality
  const startCall = () => {
    if (!selectedChat || !user) return;
    
    // Find the receiver ID (the other user in the chat)
    const receiverId = selectedChat.users.find(u => u._id !== user._id)?._id;
    if (!receiverId) {
      toast.error("Cannot identify the call recipient");
      return;
    }

    const roomId = selectedChat._id;
    
    // Emit the call-started event to the socket
    socket.emit('call-started', { receiverId, callerId: user._id });
    
    // Emit the call-user event to notify the receiver
    socket.emit('call-user', { 
      calleeId: receiverId, 
      caller: { 
        id: user._id, 
        username: user.name || user.username || "User" 
      } 
    });
    
    // Navigate to the video call page
    router.push(`/chat/video/video-call/${roomId}`);
  };

  return (
    <>
      {selectedChat && user ? (
        <>
          <div className="flex items-center justify-between bg-black py-3 px-2 w-full text-2xl font-semibold">
            <button className="block p-2 rounded-full bg-gray-200 hover:bg-gray-300" onClick={() => setSelectedChat('')}>
              <FaArrowLeft size={24} />
            </button>
            <div className="flex items-center space-x-4">
              {!selectedChat.isGroupChat ? (
                <>
                  <div className="text-white">{getSender(user, selectedChat.users)}</div>
                  <Profilemodal user={getSenderFull(user, selectedChat.users)} />
                </>
              ) : (
                <UpdateGroupChatModal fetchMessages={fetchMessages} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} user={user} />
              )}
            </div>
          </div>

          <div className="flex flex-col justify-end p-3 bg-gray-800 w-full h-full overflow-y-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <span className="loading loading-dots loading-lg"></span>
              </div>
            ) : (
              <ScrollableChats message={message} user={user} isGroupChat={selectedChat.isGroupChat} />
            )}

            {istyping && <div className="flex justify-start mb-3"><span className="loading loading-dots loading-lg text-white"></span></div>}

          <div>
            <Audio />
          </div>

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-white">Chat with {getSender(user, selectedChat.users)}</h2>
              {!selectedChat.isGroupChat && (
                <button className='btn btn-primary flex items-center gap-2' onClick={startCall}>
                  <FaVideo /> Start Call
                </button>
              )}
            </div>

            <input
              type="text"
              className="w-full p-3 me-4 bg-gray-600 text-white rounded-md"
              placeholder="Enter a message.."
              value={newMessage}
              onChange={(e) => setnewMessage(e.target.value)}
              onKeyDown={sendMessage}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-3xl text-gray-600">Click on a user to start chatting</p>
        </div>
      )}
    </>
  );
};

export default SingleChat;