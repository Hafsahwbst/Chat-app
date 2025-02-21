'use client'
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";


const Signup = () => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    username: "",
  });
  const { email, password, username } = inputValue;
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err);
  const handleSuccess = (msg) =>
    toast.success(msg);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:5000/signup",
        {
          ...inputValue,
        },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
    }
    setInputValue({
      ...inputValue,
      email: "",
      password: "",
      username: "",
    });
  };

  return (

    <div className="container-fluid h-screen flex items-center  justify-center ">
    <div className="container grid grid-cols-2 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 h-3/4 rounded-3xl shadow-xl bg-gradient-to-b  from-gray-200 via-pink-100 to-pink-200">
    <div className="flex  justify-center">
        <img src="https://cdni.iconscout.com/illustration/premium/thumb/login-3305943-2757111.png" className="h-full p-8 hide-on-mobile" alt="" />
      </div>
      <div className="flex justify-center  items-center h-full flex-col">
        <p className="text-4xl text-start mb-2 font-bold">
        Create an account
        </p>
        <p className="mb-8 text-gray-700 text-lg">Already have an account ? <Link href="/login" className="text-blue-500">Login</Link></p>
      <form className="w-1/2" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block mb-2 text-indigo-500 font-extrabold">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            required
            className="inline-block w-full p-4 leading-6 mb-8 text-lg font-extrabold placeholder-indigo-400 bg-white shadow border-2 border-indigo-400 rounded"

            placeholder="Enter your email"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-2 text-indigo-500 font-extrabold">Username</label>
          <input
            type="text"
            name="username"
            value={username}
            required
            className="inline-block w-full p-4 leading-6 mb-8 text-lg font-extrabold placeholder-indigo-400 bg-white shadow border-2 border-indigo-400 rounded"

            placeholder="Enter your username"
            onChange={handleOnChange}
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2 text-indigo-500 font-extrabold">Password</label>
          <input
            type="password"
            name="password"
            required
            value={password}
            className="inline-block w-full p-4 leading-6 mb-8 text-lg font-extrabold placeholder-indigo-400 bg-white shadow border-2 border-indigo-400 rounded"

            placeholder="Enter your password"
            onChange={handleOnChange}
          />
        </div>
        <button type="submit" className="block mx-auto bg-pink-400 text-white py-2 rounded-md  font-serif text-xl w-full">Signup</button>
       
      </form>
      </div>
   
    </div>
  </div>

  
  );
};

export default Signup;