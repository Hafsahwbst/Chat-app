"use client";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Edit = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/user/user", {
          withCredentials: true,
        });

        if (data.user) {
          setUser(data.user);
        } else {
          toast.error("User not found");
        }
      } catch (error) {
        toast.error("Unable to fetch profile. Please login again.");
        router.push("/login");
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleSubmit = async (values) => {
    try {
      if (file) {
        values.avatar = file.name;
      }
      const { data } = await axios.put(
        "http://localhost:5000/user/update-profile",
        values,
        {
          withCredentials: true,
        }
      );

      if (data.user) {
        setUser(data.user);
        toast.success("Profile Updated");
        router.push("/user/profile");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Unable to update profile. Please try again.");
    }
  };

  const uploadFile = (e) => {
    const file = e.target.files[0];
    setFile(file);
    const fd = new FormData();
    fd.append("file", file);
    axios
      .post("http://localhost:5000/upload", fd, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.status === 200) {
          console.log("file uploaded");
        }
      })
      .catch((error) => {
        toast.error("File upload failed");
      });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-4xl mx-auto transition-all duration-300">
        <h2 className="text-2xl font-bold text-indigo-500 mb-6">Edit Profile</h2>
        {user ? (
          <Formik
            initialValues={{
              username: user.username || "",
              bio: user.bio || "",
              phoneNo: user.phoneNo || "",
              email: user.email || "",
              address: user.address || "",
              avatar: user.avatar || "",
            }}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <div className="text-center grid grid-cols-8 mb-6">
                 <div className="col-span-2">
                  <img
                    src={user.avatar && `${"http://localhost:5000"}/${user.avatar}`}
                    className="w-32 h-32 rounded-full mx-auto  border-4 border-indigo-600 dark:border-blue-800 transition-transform duration-300 hover:scale-105"
                    alt="User Avatar"
                  />
                  </div>
                  <div className="col-span-6 mt-3">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Upload New Avatar</h3>
                    <input
                      type="file"
                      className="block w-full text-gray-300 bg-gray-700 p-3 rounded-lg"
                      onChange={uploadFile}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    className="mt-2 p-3 w-full bg-gray-700 text-white border border-gray-600 rounded-lg"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={values.bio}
                    onChange={handleChange}
                    rows="4"
                    className="mt-2 p-3 w-full bg-gray-700 text-white border border-gray-600 rounded-lg"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNo"
                    name="phoneNo"
                    value={values.phoneNo}
                    onChange={handleChange}
                    className="mt-2 p-3 w-full bg-gray-700 text-white border border-gray-600 rounded-lg"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    className="mt-2 p-3 w-full bg-gray-700 text-white border border-gray-600 rounded-lg"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-300">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    className="mt-2 p-3 w-full bg-gray-700 text-white border border-gray-600 rounded-lg"
                  />
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => router.push("/user/profile")}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-700 text-white px-6 py-2 rounded-lg hover:bg-indigo-800 transition-colors duration-300"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            )}
          </Formik>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Edit;
