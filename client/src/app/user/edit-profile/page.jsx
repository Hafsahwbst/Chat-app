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
    <div className="container-fluid h-full text-white">
      <div className="rounded-xl shadow-2xl max-w-4xl w-full p-8  bg-gray-800 transition-all duration-300">
        <h2 className="text-2xl font-bold text-indigo-500 mb-4">Edit Profile</h2>
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
                <img
                  src={user.avatar && `${'http://localhost:5000'}/${user.avatar}`}
                  className="w-32 rounded-full h-32 mx-auto mb-4"
                  alt="User Avatar"
                />
                <div className="my-3">
                  <h1 className="text-lg font-semibold text-indigo-500">File Uploader</h1>
                  <input
                    type="file"
                    className="shadow-sm bg-gray-700 text-gray-300 border border-gray-600 rounded-lg p-2.5 mb-3"
                    onChange={uploadFile}
                    placeholder=""
                  />
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
