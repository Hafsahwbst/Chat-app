'use client'
import { useAppContext } from '@/Context/AppProvider'
import React from 'react'
import SingleChat from '../SingleChat/page'

const Chatbox = ({ user,fetchAgain, setfetchAgain }) => {
  const { selectedChat } = useAppContext()
  return (
    <div
      className={`${
        selectedChat ? "flex" : "hidden"
      } flex-col items-center p-3 bg-gray-800 w-full md:w-2/3 rounded-lg border border-gray-200`}
    >
      <SingleChat user={user} fetchAgain={fetchAgain} setfetchAgain={setfetchAgain} />
    </div>
  )
}

export default Chatbox