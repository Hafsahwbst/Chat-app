// components/SideDrawer.jsx
import React, { useState } from 'react';
import { FaAngleDown, FaBell, FaSearch } from 'react-icons/fa';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import UserListItem from './UserComponents/UserListItem';
import axios from 'axios';
import ChatLoading from './chatLoading';
import Profilemodal from './profileModal';
import { getSender } from '../config/ChatLogics/page';
import { useAppContext } from '@/Context/AppProvider';

const SideDrawer = ({ user }) => {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setloadingChat] = useState(false);
  const [cookies, removeCookie] = useCookies([]);
  const router = useRouter();
  const {  chats, setchats,setSelectedChat, notification, setNotification } = useAppContext();


  const Logout = () => {
    removeCookie('token');
    router.push('/login');
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      toast('Please enter something in the search');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5000/user/all?search=${search}`, {
        withCredentials: true,
      });
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load the data');
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setloadingChat(true);
      const { data } = await axios.post('http://localhost:5000/access-chat', { userId }, { withCredentials: true });
      if (data && !chats.find((c) => c._id === data._id)) {
        setchats([data, ...chats]);
        setSelectedChat(data);
      } else {
        toast.error('Chat already exists or invalid data');
      }
      setloadingChat(false);
    } catch (error) {
      toast.error('Failed to fetch chat');
      setloadingChat(false);
    }
  };

  return (
    <div className=''>
      {user ? (
        <>
          <div className="grid bg-gradient-to-b  from-gray-700 to-gray-800 transition-all duration-300 animate-fade-in grid-cols-12 py-3">
            <div className="col-span-4 ms-5">
              <div className="drawer">
                <input id="my-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                  <label htmlFor="my-drawer" className="btn drawer-button">
                    <FaSearch />
                  </label>
                </div>
                <div className="drawer-side">
                  <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                  <ul className="menu bg-base-200 text-base-content min-h-full w-96 p-4">
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Search by name or email"
                        className="me-2 w-full px-4"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <button className="btn" onClick={handleSearch}>
                        Go
                      </button>
                    </div>

                    {loading ? (
                      <ChatLoading />
                    ) : (
                      searchResult.map((user) => (
                        <UserListItem key={user._id} user={user} handleFunction={() => accessChat(user._id)} />
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-span-4 flex items-center justify-center">
              <p className="text-2xl text-white font-sans">Talk-A-Tive</p>
            </div>

            <div className="col-span-4 flex justify-end me-5">
              <div className="flex items-center">
                <div className="dropdown dropdown-bottom dropdown-end">
                  <div tabIndex={0} role="button" className="btn m-1">
                    <FaBell />
                    <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">
                      {notification.length}
                    </div>
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                    {!notification.length && 'No new messages'}
                    {notification.map((notif) => (
                      <button
                        key={notif._id}
                        onClick={() => {
                          setSelectedChat(notif.chat);
                          setNotification(notification.filter((n) => n !== notif));
                        }}
                      >
                        {notif.chat && notif.chat.isGroupChat
                          ? `New Message in ${notif.chat.chatName}`
                          : notif.chat && notif.chat.users
                            ? `New Message from ${getSender(user, notif.chat.users)}`
                            : 'Error: No users found in chat'}
                      </button>
                    ))}
                  </ul>
                </div>

                <div className="dropdown dropdown-bottom dropdown-end">
                  <div tabIndex={0} role="button" className="btn m-1">
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img
                          src={user.avatar && `http://localhost:5000/${user.avatar}`}
                          className="rounded-full"
                          alt={user.username}
                        />
                      </div>
                    </div>
                    <FaAngleDown />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                  >
                    <button
                      className="btn"
                      onClick={() => document.getElementById('my_modal_2').showModal()}
                    >
                      Profile
                    </button>
                    <dialog id="my_modal_2" className="modal">
                      <div className="modal-box w-11/12 max-w-5xl">
                        <Profilemodal user={user} />
                      </div>
                      <form method="dialog" className="modal-backdrop">
                        <button>Close</button>
                      </form>
                    </dialog>
                    <li>
                      <button className="btn my-2 text-red-500" onClick={Logout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
      {loadingChat && <span className="loading loading-spinner loading-lg"></span>}
    </div>
  );
};

export default SideDrawer;
