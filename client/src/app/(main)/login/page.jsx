"use client"
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        'http://localhost:5000/login',
        { email, password },
        { withCredentials: true }
      );

      if (data.status) {
        toast.success("Logged in")
        router.push('/user/profile');
      } else {
        toast.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred while logging in.');
    }
  };
  return (

    <>
      <div className="container-fluid h-screen bg-gradient-to-b  from-gray-700 to-gray-800 flex items-center  justify-center">
        <div className="container grid grid-cols-2  sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 h-3/4 rounded-3xl text-white bg-transparent">
          <div className="flex justify-center  items-center h-full flex-col">
            <p className="text-4xl text-start mb-2 font-bold">
              Login
            </p>
            <p className="mb-8 font-bold text-gray-400 text-lg">New User ? <Link href="/signup" className="text-blue-500">Signup</Link></p>
            <form className="w-1/2" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email" className="block mb-2 text-indigo-500 font-extrabold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                className="inline-block w-full p-4 leading-6 mb-8 text-lg font-extrabold placeholder-indigo-400 bg-transparent shadow border-2 border-indigo-400 rounded"
                  placeholder="Enter your email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div><div className="flex justify-between">
                <label htmlFor="password" className="block mb-2 text-indigo-500 font-extrabold">Password</label>
                <Link
                  href="/forget-password"
                  className="underline font-bold text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
                <input
                  type="password"
                  name="password"
                  required
                  className="inline-block w-full p-4 leading-6 mb-8 text-lg font-extrabold placeholder-indigo-400 bg-transparent shadow border-2 border-indigo-400 rounded"

                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}

                />
              </div>


              <button type="submit" className="block mx-auto bg-pink-400 text-white py-2 rounded-md  font-serif text-xl w-full">Submit</button>

            </form>
          </div>
          <div className="flex  justify-center">
            <img src="https://cdni.iconscout.com/illustration/premium/thumb/login-3305943-2757111.png" className="h-full p-8 hide-on-mobile" alt="" />
          </div>
        </div>
      </div>


    </>
  );
};

export default Login;