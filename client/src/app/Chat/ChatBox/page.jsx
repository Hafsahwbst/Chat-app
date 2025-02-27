'use client'
import { useAppContext } from '@/Context/AppProvider'
import React from 'react'
import SingleChat from '../SingleChat/page'

const Chatbox = ({ fetchAgain, setfetchAgain }) => {
  const { selectedChat,user } = useAppContext()

  return (
    <div
      className={`${selectedChat ? "flex" : "hidden"
        } flex-col items-center p-3 bg-gray-800 w-full md:w-2/3 rounded-lg border border-gray-200`}
    >
      {user ? (
        <>
          <SingleChat user={user} fetchAgain={fetchAgain} setfetchAgain={setfetchAgain} />

        </>
      ) : (
        <p className="">Loading</p>
      )}
    </div>
  )
}

export default Chatbox