import React from 'react'
import { IoIosClose } from "react-icons/io";

const UserBage = ({ handleFunction, user }) => {
  return (
    <div className='px-2 py-1 rounded-lg m-1 mb-2 text-12 flex items-center gap-2'>
      <span>{user.username}</span>
      <IoIosClose onClick={handleFunction} className="cursor-pointer text-2xl" />
    </div>
  )
}

export default UserBage;
