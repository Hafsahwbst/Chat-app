'use client';
import { getSender, getSenderFull } from '@/app/config/ChatLogics/page';
import UpdateGroupChatModal from '@/app/miscelleneous/UpdateGroupChatModal';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa';
import { io } from 'socket.io-client';
import ScrollableChats from '../ScrollableChats/page';
import Profilemodal from '@/app/miscelleneous/profileModal';
import axios from 'axios';
import { useAppContext } from '@/Context/AppProvider';
import VoiceRecorder from '../voiceRecorder/page';
import Video from '../video-call/page';

const socket = io('http://localhost:5000',{ transports: ['websocket'] });
var selectedChatCompare;


const SingleChat = ({ fetchAgain, setFetchAgain }) => {

  const { selectedChat, setSelectedChat, notification, setNotification,user } = useAppContext();
  const [socketConnected, setsocketConnected] = useState(false);
  const [message, setmessage] = useState([]);
  const [loading, setloading] = useState(false);
  const [newMessage, setnewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);


  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setloading(true);
      const { data } = await axios.get(`http://localhost:5000/fetch-message/${selectedChat._id}`, {
        withCredentials: true
      });
      setmessage(data);
      setloading(false);
      socket.emit('join chat', selectedChat._id);
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
      // socket.emit('setup', user);
      socket.on('connected', () => setsocketConnected(true));
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

  const handleSendAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice_message.wav');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/upload-voice-message',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.filePath) {
        const audioMessage = {
          content: response.data.filePath,
          audio: true,
          chatId: selectedChat._id,
        };

        socket.emit('new message', audioMessage);
        setmessage((prevMessages) => [...prevMessages, audioMessage]);
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
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

            <VoiceRecorder onSend={handleSendAudio} />
            <Video roomId={selectedChat._id} />

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
