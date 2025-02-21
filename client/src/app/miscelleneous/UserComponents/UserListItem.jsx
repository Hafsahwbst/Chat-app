import React from 'react';

const UserListItem = ({ user, handleFunction }) => {
  return (
    <div  onClick={ handleFunction} className="flex items-center w-84 mt-3  gap-4 p-2 border-b border-gray-300 hover:bg-gray-100 cursor-pointer">
      {/* Display User Avatar */}
      <div className="avatar">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img
            src={user.avatar ? `http://localhost:5000/${user.avatar}` : 'https://via.placeholder.com/150'}
            alt={user.username}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      
      {/* Display User Information */}
      <div className=" ">
        <p className="font-semibold text-lg">{user.username}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>

      {/* Action Button to Start Chat */}
      {/* <button
       
        className="ml-auto  px-4 py-2 bg-[#38B2AC] text-white rounded-md hover:bg-[#319D93]">
        Start Chat
      </button> */}
    </div>
  );
};

export default UserListItem;
