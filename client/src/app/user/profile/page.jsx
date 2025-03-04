"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/user/user', { withCredentials: true });

        if (data.user) {
          setUser(data.user);
        } else {
          toast.error('User not found');
        }
      } catch (error) {
        toast.error('Unable to fetch profile. Please login again.');
        router.push('/login');
      }
    };

    fetchUserProfile();
  }, [router.push]);

  const deletefunc = async () => {
    try {
      const { data } = await axios.delete('http://localhost:5000/user/delete-profile', {
        withCredentials: true
      });

      if (data.message === "User profile deleted successfully") {
        toast.success(data.message);
        router.push('/login');
      } else {
        toast.error('Failed to delete profile');
      }
    } catch (error) {
      toast.error('An error occurred while deleting your profile');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <title>User Profile</title>
      {user ? (
        <div className="bg-gradient-to-b from-gray-700 to-gray-800 p-8 rounded-xl shadow-2xl max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-center">
            {/* Profile Image and Edit/Delete Buttons */}
            <div className="text-center md:w-1/3 mb-8 md:mb-0">
              <img
                src={user.avatar && `${'http://localhost:5000'}/${user.avatar}`}
                alt="Profile Picture"
                className="rounded-full w-48 h-48 mx-auto mb-4 border-4 border-indigo-600 dark:border-blue-800 transition-transform duration-300 hover:scale-105"
              />
              <h1 className="text-2xl font-bold text-white mb-2">{user.username}</h1>
              <div className="space-x-2">
                <button
                  onClick={() => router.push("/user/edit-profile")}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                >
                  Edit Profile
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4 hover:bg-red-700 transition-colors duration-300"
                  onClick={deletefunc}
                >
                  Delete Profile
                </button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="md:w-2/3 md:pl-8">
              <h2 className="text-xl font-semibold text-indigo-500 mb-4">Bio</h2>
              <p className="text-gray-300 mb-6">{user.bio}</p>

              <h2 className="text-xl font-semibold text-indigo-500 mb-4">Contact Information</h2>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-indigo-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {user.email}
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-indigo-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {user.phoneNo}
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-indigo-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {user.address}
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-300">Loading...</p>
      )}

    
    </div>
  );
};

export default Profile;
