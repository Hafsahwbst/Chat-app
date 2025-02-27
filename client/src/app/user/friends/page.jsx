"use client"
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaUserFriends } from 'react-icons/fa';
import { io } from 'socket.io-client';
const socket = io("http://localhost:5000", { withCredentials: true })

const Friends = () => {
  const [user, setUser] = useState([]);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [notification, setnotification] = useState(null)
  const [onlineUsers, setonlineUsers] = useState([])

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get('http://localhost:5000/all-friends',
          { withCredentials: true }
        );
        setFriends(response.data.friends);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, []);

  useEffect(() => {
    const userId = "user._id"
    socket.emit('setup', { id: userId })
    socket.on('friend-request', (data) => {
      setnotification(data.senderId)
    })
    return () => {
      socket.off('friend-request')
    }
  }, [])
  // Fetch all users
  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/all");
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };


  // Send friend request
  const sendRequest = async (receiverId, senderId) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/send-request',
        { receiverId },
        { withCredentials: true }
      );
      console.log('Server Response:', response.data);
      if (response.status === 201 && response.data.status) {
        toast.success("Friend request sent");
        setSentRequests((prevSet) => new Set(prevSet).add(receiverId));
        socket.emit('friend-request', { receiverId, senderId })

      } else {
        toast.error("Failed to send friend request");
      }
    } catch (error) {
      console.error("Error sending friend request:", error.response || error);
      toast.error("Failed to send friend request");
    }
  };
  const recieveRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/recieve-request", {
        withCredentials: true
      })
      console.log("Received friend requests:", response.data);
      setFriendRequests(response.data)
    } catch (error) {
      console.error("Error fetching requests", error);
    }
  }

  // Accept friend request
  const acceptRequest = async (requestsId) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/accept-request',
        { requestsId },
        { withCredentials: true }
      );
      toast.success("Friend request accepted")
      console.log(response.data, ">>>>>");
      ;
      setFriendRequests(prev => prev.filter(req => req._id !== requestsId));
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request");
    }
  };

  // Reject friend request
  const rejectRequest = async (requestsId) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/decline-request',
        { requestsId },
        { withCredentials: true }
      );
      toast.success("Friend request rejected");
      setFriendRequests(prev => prev.filter(req => req._id !== requestsId)); // Remove rejected request from UI
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Failed to reject friend request");
    }
  };

  useEffect(() => {
    fetchUsers();
    recieveRequests();

    socket.on("get-online-users", (onlineUsers) => {
      setonlineUsers(onlineUsers)
    })
    return () => {
      socket.off("get-online-users")
    }
  }, [socket]);


  const deletefunc = async (friendId) => {
    try {
      const { data } = await axios.delete('http://localhost:5000/delete-friend', {
        friendId: friendId // Pass the friendId in the request body
      }, {
        withCredentials: true
      });

      if (data.message === "Friend removed successfully") {
        toast.success(data.message);
        router.push('/user/friends');
      } else {
        toast.error('Failed to remove friend');
      }
    } catch (error) {
      toast.error('An error occurred while removing friend');
      console.error(error);
    }
  };


  return (
    <div className=' grid grid-cols-12 mx-5 my-2'>

      <div className="col-span-9 ">
        {user !== null ? (
          <div className="container-fluid  mx-auto p-6">
            <div className="rounded-xl shadow-2xl max-w-4xl w-full p-8  bg-gray-800 transition-all duration-300 ">

              <div className="flex justify-between">
                <h1 className="text-3xl font-bold  text-white mb-6">All users</h1>
                <div>
                  {/* Open the modal using document.getElementById('ID').showModal() method */}
                  <button className="btn" onClick={() => document.getElementById('my_modal_2').showModal()}>

                    <FaUserFriends />
                  </button>
                  <dialog id="my_modal_2" className="modal">
                    <div className="modal-box">
                      <span className='text-3xl font-bold '>Friend Requests</span>
                      {friendRequests && friendRequests.length > 0 ? (
                        <ul >
                          {friendRequests.map((request) => (
                            <li className='my-4' key={request._id}>
                              <div className="flex justify-between">
                                <p className='text-xl'>
                                  {request.sender ? request.sender.username : 'Unknown Sender'}
                                </p>
                                <div className=""> <button className='bg-white text-blue-500 px-2 py-1 rounded' onClick={() => acceptRequest(request._id)}>Accept</button>
                                  <button className='bg-red-500 px-2 py-1 rounded ms-2' onClick={() => rejectRequest(request._id)}>Reject</button></div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No pending friend requests</p>
                      )}
                    </div>
                    <form method="dialog" className="modal-backdrop">
                      <button>close</button>
                    </form>
                  </dialog>
                </div>
              </div>


              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-xl text-left text-white font-bold">Friend</th>
                      <th className="px-4 py-2 text-xl text-left text-white font-bold">Status</th>
                      <th className="px-4 py-2 text-xl text-left text-white font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user && user.length > 0 && user.map((obj) => (
                      <tr className="border-b" key={obj._id}>
                        <td className="px-4 py-2 text-white">{obj.username}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => sendRequest(obj._id)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            disabled={sentRequests.has(obj._id)}
                          >
                            {sentRequests.has(obj._id) ? 'Delete Request' : 'Add Friend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}




        <div className="container-fluid mx-auto p-6">
          <div className="rounded-xl shadow-2xl max-w-4xl w-full p-8  bg-gray-800 transition-all duration-300">
            <h2 className='text-3xl text-white mb-6 font-bold'>Your Friends</h2>
            <ul>
              {friends.map((friend) => (
                <div key={friend._id} className="flex text-white items-center justify-between my-4">
                  <div className='flex items-center'> <li >
                    <img className='w-12 me-4 rounded-full' src={friend.avatar && `http://localhost:5000/${friend.avatar}`} alt="" /></li>
                    <li>{friend.username}</li></div>
                  <button onClick={deletefunc} className="text-red-500">
                    Remove
                  </button>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* <div className='col-span-3 bg-blue-500 h-screen text-white  rounded-xl p-8'>
      
      </div> */}
    </div>
  );
};

export default Friends;
