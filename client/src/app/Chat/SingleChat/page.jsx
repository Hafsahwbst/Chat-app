'use client'
import { getSender, getSenderFull } from '@/app/config/ChatLogics/page';
import UpdateGroupChatModal from '@/app/miscelleneous/UpdateGroupChatModal';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaEye } from 'react-icons/fa';
import { io } from 'socket.io-client';
import ScrollabeChats from '../ScrollableChats/page';
import Profilemodal from '@/app/miscelleneous/profileModal';
import axios from 'axios';
import { useAppContext } from '@/Context/AppProvider';
import VoiceRecorder from '../voiceRecorder/page';


const socket = io('http://localhost:5000');
var selectedChatCompare;



const SingleChat = ({ fetchAgain, setFetchAgain, user }) => {
  const { selectedChat, setSelectedChat, notification, setNotification } = useAppContext();
  const [socketConnected, setsocketConnected] = useState(false);
  const [message, setmessage] = useState([]);
  const [loading, setloading] = useState(false);
  const [newMessage, setnewMessage] = useState("");
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
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to Load the Messages");
      setloading(false);
    }
  };


  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        setnewMessage("");
        const { data } = await axios.post("http://localhost:5000/message", {
          content: newMessage,
          chatId: selectedChat._id,
        }, { withCredentials: true });
        socket.emit("new message", data);
        setmessage([...message, data]);
      } catch (error) {
        toast.error("Failed to send message");
      }
    }
  };

  useEffect(() => {
    if (!socket) {
      console.error("Socket not initialized!");
      return;
    }

    if (user) {
      socket.emit("setup", user);
      socket.on("connected", () => setsocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
    }
    return () => {
      socket.off("connected");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [user]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {    //we check if any chat is selected or if the chat is not equal to tha  message send by the server
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification])
          // setFetchAgain(!fetchAgain)
        }
      } else {
        setmessage([...message, newMessageRecieved]);
      }
    });
  });

  const typingHandler = (e) => {
    setnewMessage(e.target.value);
    // Typing indicator Logic
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    //decide when to stop typing it will stop indicating typing after 3 sec
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleSendAudio = (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice_message.wav');

    axios.post('http://localhost:5000/upload-voice-message', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(response => {
        const audioMessage = { content: response.data.filePath, audio: true };
        socket.emit("new message", audioMessage); // Broadcast message to the chat
        setmessage([...message, audioMessage]); // Add audio message to local chat state
      })
      .catch(err => {
        console.error('Error uploading audio:', err);
      });
  };


  return (
    <>
      {selectedChat ? (
        <>
          <div className="flex items-center justify-between bg-black  py-3 px-2 w-full text-2xl font-semibold">
            <button
              className="block  p-2 rounded-full bg-gray-200 hover:bg-gray-300"
              onClick={() => setSelectedChat("")}
            >
              <FaArrowLeft size={24} />
            </button>
            <div className="flex items-center space-x-4">
              {!selectedChat.isGroupChat ? (
                <>
                  <div className='text-white'>{getSender(user, selectedChat.users)}</div>
                  {/* Profile Modal */}
                  <dialog id="my_modal_2" className="modal">
                    <div className="modal-box">
                      {/* Show profile of the other user (not the logged-in user) */}
                      <Profilemodal user={getSenderFull(user, selectedChat.users)} />
                      <form method="dialog" className="modal-backdrop">
                        <button className="btn btn-sm btn-ghost">Close</button>
                      </form>
                    </div>
                  </dialog>
                </>
              ) : (
                <div className="text-lg font-semibold flex items-center  gap-4 ">
                  <span className="text-white"> {selectedChat.chatName.toUpperCase()}</span>
                  <UpdateGroupChatModal fetchMessages={fetchMessages} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} user={user} />
                </div>
              )}
            </div>
          </div>



          {/* Chat Window */}
          <div className="flex flex-col justify-end p-3 bg-[url('https://wallpapercave.com/wp/wp10254519.png')] object-cover bg-contain w-full h-full  overflow-y-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <span className="loading loading-dots loading-lg"></span>
              </div>
            ) : (
              <div className="messages">
                <ScrollabeChats message={message} user={user} isGroupChat={selectedChat.isGroupChat} />
              </div>
            )}


            {istyping && (
              <div className="flex justify-start mb-3">
                <span className="loading loading-dots loading-lg text-white"></span>
              </div>
            )}
            <VoiceRecorder onSend={handleSendAudio} />
            <input
              type="text"
              className="w-full p-3 me-4 bg-gray-600 text-white rounded-md"
              placeholder="Enter a message.."
              value={newMessage}
              onChange={typingHandler}
              onKeyDown={sendMessage}
            />
            <div>


            </div>
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
