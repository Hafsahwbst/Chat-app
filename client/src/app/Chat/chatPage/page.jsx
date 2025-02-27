"use client";

import React, { useEffect, useState } from 'react';
import Chatbox from '@/app/Chat/ChatBox/page'; // Make sure this path is correct
import Mychats from '@/app/Chat/MyChats/page';  // Make sure this path is correct
import SideDrawer from '@/app/miscelleneous/SideDrawer'; // Make sure this path is correct
import axios from 'axios';
import { useAppContext } from '@/Context/AppProvider';

const Chat = () => {
  const [user, setUser] = useState(null);
  const [fetchAgain, setfetchAgain] = useState(false)
  const { setselectedChat } = useAppContext()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user/user', {
          withCredentials: true,  // Make sure the cookies are being sent
        });

        if (response.status === 200) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

// useEffect(() => {
//   socket.emit('setup', (user))
// })
  

  return (
    <div style={{ width: "100%" }}>
      <SideDrawer user={user} setselectedChat={setselectedChat} />
      <div className="container-fluid bg-[url('https://images.squarespace-cdn.com/content/v1/63e991ddebdc00680331f4fa/d4ce3e31-6f96-439d-8918-4e6318285ec9/Untitled-1.png?format=2500w')] object-cover bg-cover flex justify-between w-screen p-10 " style={{height:"90vh"}}>
        {user ? (
          <>
            <Mychats  fetchAgain={fetchAgain} user={user} />
            <Chatbox  fetchAgain={fetchAgain} setfetchAgain={setfetchAgain}  user={user} />
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
