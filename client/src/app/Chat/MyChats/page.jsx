import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import { useAppContext } from '@/Context/AppProvider';
import toast from 'react-hot-toast';
import ChatLoading from '@/app/miscelleneous/chatLoading';
import { getSender } from '@/app/config/ChatLogics/page';
import GroupChatModal from '@/app/miscelleneous/groupChatModel';

const MyChats = ({ user, fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, chats, setChats } = useAppContext();

  useEffect(() => {
    setLoggedUser(user);
  }, [user]);

  // Fetch chats for the logged-in user
  const fetchChats = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/fetch-chat', { withCredentials: true });
      setChats(data);
    } catch (error) {
      toast.error('Unable to fetch chats');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  return (
    <div
      className={`${selectedChat ? 'hidden' : 'flex'
        } md:flex flex-col items-center p-3 bg-gray-800 w-full md:w-1/3 rounded-lg border border-gray-600`}
    >
      <div className="py-3 flex w-full justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">My Chats</h2>
        <button
          className="btn"
          onClick={() => document.getElementById('my_modal_3').showModal()}
        >
          New Group Chat <FaPlus />
        </button>
        <dialog id="my_modal_3" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <GroupChatModal user={user} />
          </div>
        </dialog>
      </div>

      <div className="flex flex-col p-3  bg-gradient-to-b  from-gray-700 to-gray-800   shadow-2xl max-w-4xl  transition-all duration-300 animate-fade-in w-full h-full rounded-lg overflow-y-scroll">
        {chats.length === 0 ? (
          <ChatLoading />
        ) : (
          <div className="w-full space-y-2">
            {chats.map((chat) => {
              return (
                <div key={chat._id}>
                  <div
                    onClick={() => setSelectedChat(chat)}
                    className={`flex justify-between items-center p-3 rounded cursor-pointer ${selectedChat === chat ? 'bg-[#3f9bd5] text-white' : 'bg-gray-500 text-white'
                      } hover:bg-[#3f9bd5] hover:text-white`}
                  >
                    <p>
                      {!chat.isGroupChat
                        ? getSender(loggedUser, chat.users) // Get the sender for direct chats
                        : chat.chatName}
                    </p>

                    <div className="text-sm text-blue-200">
                      {chat.latestMessage ? (
                        <>
                          {chat.isGroupChat && chat.latestMessage.sender ? (
                            <>
                              {/* Display the sender name above the message in group chat */}
                              <div className="font-semibold">{chat.latestMessage.sender.username}</div>
                              <div>
                                {chat.latestMessage.content.length > 50
                                  ? chat.latestMessage.content.substring(0, 51) + '...'
                                  : chat.latestMessage.content}
                              </div>
                            </>
                          ) : (
                            <>
                              {/* For non-group chats, display sender and message */}
                              {chat.latestMessage.sender ? (
                                <>
                                  {chat.latestMessage.sender.username}:
                                  {chat.latestMessage.content.length > 50
                                    ? chat.latestMessage.content.substring(0, 51) + '...'
                                    : chat.latestMessage.content}
                                </>
                              ) : (
                                'No sender available'
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        'No messages yet'
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyChats;
