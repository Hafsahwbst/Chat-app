import { useAppContext } from '@/Context/AppProvider'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import UserListItem from './UserComponents/UserListItem'
import axios from 'axios'
import UserBage from './UserComponents/userBadge'

const GroupChatModal = ({ user, onClose }) => {
    const [groupChatName, setgroupChatName] = useState("")
    const [selectedUsers, setselectedUsers] = useState([])
    const [search, setsearch] = useState("")
    const [searchResult, setsearchResult] = useState([])
    const [loading, setloading] = useState(false)

    const { chats, setChats } = useAppContext()

    // Handle Search Logic
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!search.trim()) {
                setsearchResult([]); // Clear results if search is empty
                return;
            }

            try {
                setloading(true);
                const { data } = await axios.get(`http://localhost:5000/user/all?search=${search}`, {
                    withCredentials: true,
                });
                setsearchResult(data);
                setloading(false);
            } catch (error) {
                toast.error("Failed to load the data");
                setloading(false);
            }
        }

        fetchSearchResults();
    }, [search]);


    const handleSearch = (e) => {
        setsearch(e.target.value);
    }

    const handleGroup = (user) => {
        setselectedUsers(prev => [...prev, user]);
    }

    const handleSubmit = async () => {
        if (!groupChatName || selectedUsers.length === 0) {
            toast.error("Please fill all the fields");
            return;
        }

        try {
            // Prepare the request data to send to backend
            const groupData = {
                name: groupChatName,
                users: selectedUsers.map(u => u._id), // Send only user IDs (array)
            };

            // Send the group creation request to the backend
            const { data } = await axios.post("http://localhost:5000/group", groupData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json", // Ensure this header is set
                },
            });

            // Successfully created group, update state
            setChats([data, ...chats]);

            toast.success("New group created");
        } catch (error) {
            console.error("Error while creating group chat", error);
            toast.error("Something went wrong");
        }
    };

    return (
        <>
            <header className="text-black  py-4">
                <p className="text-2xl text-center font-semibold">Create Group Chat</p>
            </header>

            <div className="flex flex-col items-center  py-6">
                <form className="w-full max-w-lg space-y-4">
                    {/* Group Name Input */}
                    <input
                        type="text"
                        placeholder="Group Name"
                        className="input w-full max-w-xs p-3  rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={groupChatName}
                        onChange={(e) => setgroupChatName(e.target.value)}
                    />

                    {/* Add Users Search Input */}
                    <input
                        type="text"
                        placeholder="Add users"
                        className="input w-full max-w-xs p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={search}
                        onChange={handleSearch}
                    />
                </form>

                {/* Selected Users Display */}
                {selectedUsers.length > 0 && (
                    <div className="mt-6 w-full max-w-lg">
                        <p className="text-lg font-semibold">Selected Users:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedUsers.map(u => (
                                <div key={u._id} className="bg-gray-500 rounded-full px-3 text-white">
                                    <UserBage user={u} handleFunction={() => handleDelete(u)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Render search results */}
                {loading ? (
                    <div className="mt-4 text-gray-500">Loading...</div>
                ) : (
                    <div className="w-full max-w-lg mt-4">
                        {searchResult?.slice(0, 4).map(user => (  // Limit the result to 4 users
                            <UserListItem
                                key={user._id}
                                user={user}
                                handleFunction={() => handleGroup(user)}
                            />
                        ))}
                    </div>
                )}

                <div className="modal-action">
                    <form method="dialog">
                        <button
                            className="btn bg-indigo-600 text-white py-2 px-6 rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onClick={handleSubmit}
                        >
                            Create Chat
                        </button>
                    </form>
                </div>
                <footer className="mt-6">

                </footer>
            </div>

        </>
    )
}

export default GroupChatModal;
