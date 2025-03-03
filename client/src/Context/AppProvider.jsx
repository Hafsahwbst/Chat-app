import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io("http://localhost:5000", { transports: ['websocket'] }); 

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState();
  const [notification, setNotification] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setsocketConnected] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user/user', {
          withCredentials: true,
        });
         if (response.status === 200) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
        return { props: { user :response.data.user} };      
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      socket.emit('setup', user);
      socket.on('connected', () => setsocketConnected(true));

      return () => {
        socket.off('connected'); 
      };
    }
  }, [user]);

  return (
    <AppContext.Provider value={{ 
      socket, 
      chats, setChats, 
      selectedChat, setSelectedChat, 
      socketConnected, setsocketConnected, 
      notification, setNotification, 
      user, setUser, loading 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
