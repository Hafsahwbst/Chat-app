import { useState } from "react";
import { FaEye } from "react-icons/fa";
import axios from "axios";
import UserListItem from "./UserComponents/UserListItem";
import UserBage from "./UserComponents/userBadge";
import { useAppContext } from "@/Context/AppProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain, user }) => {
  const [groupChatName, setGroupChatName] = useState(""); // Store the group chat name
  const [search, setSearch] = useState(""); // Store the search query
  const [searchResult, setSearchResult] = useState([]); // Store search results
  const [loading, setLoading] = useState(false); // Manage loading state
  const [renameloading, setRenameLoading] = useState(false); // Manage rename loading state
  const [isOpen, setIsOpen] = useState(false); // Control modal visibility
  const router = useRouter();
  const { selectedChat, setSelectedChat } = useAppContext(); // App context to get selected chat

  // Search users to add to group
  const handleSearch = async (query) => {
    setSearch(query); // Update search state
    if (!query) {
      return; // If search query is empty, exit
    }

    try {
      setLoading(true); // Show loading spinner
      const { data } = await axios.get(`http://localhost:5000/user/all?search=${query}`, { withCredentials: true });
      setLoading(false);
      setSearchResult(data); // Store search results
    } catch (error) {
      console.error(error);
      toast.error("Failed to load the search results");
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return; // If no group name entered, exit
  
    try {
      setRenameLoading(true);
      const { data } = await axios.put(
        `http://localhost:5000/rename-group`,
        { chatId: selectedChat._id, chatName: groupChatName },
        { withCredentials: true }
      );
      if (data && data._id) {
        setSelectedChat(data);
        // setFetchAgain(!fetchAgain);
        toast.success("Group name updated successfully");
        setRenameLoading(false)
        router.push('/chat/chatPage');
      } else {
        toast.error('Failed to rename group');
      }
    } catch (error) {
      setRenameLoading(false);
      console.error("Error occurred while renaming:", error); // Log full error for debugging
      const errorMessage = error.response?.data?.message || "Error while renaming the group";
      toast.error(errorMessage);
    }
    
  
    setGroupChatName(""); // Clear group name input
  };
  

  // Handle adding users to the group
  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast.error("User is already in the group!"); // If user already in group, exit
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast.error("Only admins can add users!"); // Only admin can add users
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.put(
        `http://localhost:5000/add-to-group`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        { withCredentials: true }
      );
      setSelectedChat(data); 
      setFetchAgain(!fetchAgain); 
      setLoading(false);
      toast.success("User added to the group");
    } catch (error) {
      toast.error("Failed to add user to the group");
      setLoading(false);
    }
  };

  // Handle removing users from the group
  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast.error("Only admins can remove users!"); // Only admins can remove users
      return;
    }

    try {
      const { data } = await axios.put(
        `http://localhost:5000/remove-from-group`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        { withCredentials: true }
      );
      user1._id === user._id ? setSelectedChat() : setSelectedChat(data); // If user removes themselves, set chat to empty
      // setFetchAgain(!fetchAgain);
      fetchMessages();
      toast.success("Left the group");
    } catch (error) {
      toast.error("Failed to leave the group");
    }
    setGroupChatName(""); // Clear group name input
  };

  // Handle deleting the group
  const handleDeleteGroup = async () => {
    if (selectedChat.groupAdmin._id !== user._id) {
      toast.error("Only admins can delete the group!"); // Only admins can delete the group
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/delete-group`,
        { data: { chatId: selectedChat._id }, withCredentials: true }
      );
      toast.success("Group deleted successfully!");
      router.push("/chatPage"); // Navigate to chat page after deletion
    } catch (error) {
      toast.error("Failed to delete the group");
    }
  };

  // Toggle modal open/close
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return (
    <>
      <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300" onClick={onOpen}>
        <FaEye size={24} />
      </button>

      <div className={`fixed inset-0 z-50 bg-gray-500 bg-opacity-50 flex justify-center items-center ${isOpen ? "block" : "hidden"}`}>
        <div className="relative bg-white w-full max-w-lg rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{selectedChat.chatName}</h2>
            <button className="text-xl text-gray-500" onClick={onClose}>×</button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap pb-3">
              {selectedChat.users.map((u) => (
                <UserBage key={u._id} user={u} admin={selectedChat.groupAdmin} handleFunction={() => handleRemove(u)} />
              ))}
            </div>

            <div className="mb-4">
              <input
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Chat Name"
                value={selectedChat.groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <button
                className="mt-2 w-full bg-teal-500 text-white p-2 rounded-md"
                onClick={handleRename}
                disabled={renameloading}
              >
                {renameloading ? "Updating..." : "Update"}
              </button>
            </div>

            <div>
              <input
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                placeholder="Add User to group"
                onChange={(e) => handleSearch(e.target.value)}
              />

              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                searchResult?.map((user) => (
                  <UserListItem key={user._id} user={user} handleFunction={() => handleAddUser(user)} />
                ))
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            {selectedChat.groupAdmin._id === user._id ? (
              <button
                className="w-full bg-red-500 text-white py-2 rounded-md"
                onClick={handleDeleteGroup}
              >
                Delete Group
              </button>
            ) : (
              <button
                className="w-full bg-gray-500 text-white py-2 rounded-md"
                onClick={() => handleRemove(user)}
              >
                Leave Group
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateGroupChatModal;
