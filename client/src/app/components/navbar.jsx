"use client";
import { useAppContext } from '@/Context/AppProvider';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { CiMenuKebab } from "react-icons/ci";

const Navbar = () => {
  const { user } = useAppContext();
  const [dropdownopen, setDropdownOpen] = useState(false);
  const [Open, setOpen] = useState(false);
  const router = useRouter();
  const [cookies, removeCookie] = useCookies([]);
  const [loading, setLoading] = useState(true); // Track loading state for user data

  // Logout function
  const Logout = () => {
    removeCookie("token");
    router.push("/login");
  };

  // If no user, redirect to login page
  useEffect(() => {
    if (user === null && !loading) {
      router.push('/login');
    } else if (user !== null) {
      setLoading(false); // Once user is found, stop loading
    }
  }, [user, router, loading]);

  return (
    <div>
      {/* Render Navbar only if user is available */}
      {user ? (
        <nav className="bg-white">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <button
                  type="button"
                  onClick={() => setOpen(!Open)}
                  className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset"
                  aria-controls="mobile-menu"
                  aria-expanded="false"
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">DropdownOpen main menu</span>
                  <CiMenuKebab className="text-white" />
                </button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    <Link href="/" aria-current="page">
                      <img src="/Talk-a-tive.png" className="w-20" alt="Logo" />
                    </Link>
                    <Link href="/chat/chatPage" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                      Chat
                    </Link>
                    <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                      Projects
                    </a>
                    <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                      Calendar
                    </a>
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button type="button" className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                </button>

                {/* Profile dropdown */}
                <div className="relative ml-3">
                  <div>
                    <button
                      type="button"
                      className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                      onClick={() => setDropdownOpen(!dropdownopen)}
                    >
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">DropdownOpen user menu</span>
                      <img className="size-8 rounded-full" src={user.avatar && `http://localhost:5000/${user.avatar}`} alt="Avatar" />
                    </button>
                  </div>
                  {dropdownopen && (
                    <div className="absolute right-0  z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 focus:outline-hidden" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex={-1}>
                   <div className="flex border-b m-2">  
                    <img className="size-8 ms-4 rounded-full" src={user.avatar && `http://localhost:5000/${user.avatar}`} alt="Avatar" />
                  
                      <Link href="/user/profile" className="block  px-4 py-2 text-md text-gray-900 font-semibold" role="menuitem" tabIndex={-1} id="user-menu-item-0">
                      Hafsah
                      </Link>
                      </div> 
                      <Link href="/chat/chatPage" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1} id="user-menu-item-0">
                        Chat
                      </Link>
                      <Link href="/user/friends" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={-1} id="user-menu-item-1">
                        Friends
                      </Link>
                      <button className="block px-4 py-2 text-sm text-red-500 font-bold" onClick={Logout}>
                        LOGOUT
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {Open && (
            <div className="sm:hidden" id="mobile-menu">
              <div className="space-y-1 px-2 pt-2 pb-3">
                <a href="#" className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white" aria-current="page">
                  Dashboard
                </a>
                <Link href="/chatPage" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                  Team
                </Link>
                <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                  Projects
                </a>
                <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                  Calendar
                </a>
              </div>
            </div>
          )}
        </nav>
      ) : (
        <p>Loading...</p> // You can replace this with a more appropriate loading message if necessary
      )}
    </div>
  );
};

export default Navbar;
