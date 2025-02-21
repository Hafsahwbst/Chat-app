'use client'
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState();
  const [notification, setNotification] = useState([]);

  return (
    <AppContext.Provider value={{ chats, setChats, selectedChat, setSelectedChat,notification, setNotification }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => { 
  return useContext(AppContext);
};
