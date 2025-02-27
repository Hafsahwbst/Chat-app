import Navbar from '@/app/components/navbar'
import React from 'react'

const Home = () => {
  const links = [
    { name: 'Messages', href: '/chat/chatPage' },
    { name: 'Contacts', href: '/contacts' },
    { name: 'Settings', href: '/settings' },
    { name: 'Profile', href: 'user/profile' },
  ]

  const recentChats = [
    { name: 'John Doe', lastMessage: 'Hey, are you free for a call?', time: '10m ago' },
    { name: 'Sarah Lee', lastMessage: 'Got the documents, thanks!', time: '1h ago' },
    { name: 'Jane Smith', lastMessage: 'Let’s meet at 3 PM', time: '3h ago' },
  ]

  const trendingTopics = [
    { name: 'AI in Chatbots', messages: '125 messages', time: '2 hours ago' },
    { name: 'Team Collaboration Tools', messages: '98 messages', time: '1 day ago' },
    { name: 'Data Privacy', messages: '75 messages', time: '3 days ago' },
  ]

  const testimonials = [
    { name: 'John Doe', message: 'This app made communication with my team so easy and effective!' },
    { name: 'Sarah Lee', message: 'Love the simple interface and real-time messaging. Highly recommend it!' },
    { name: 'Jane Smith', message: 'A game-changer for remote work and staying connected with everyone.' },
  ]

  return (
    <div>
      <Navbar />
      <div className="relative isolate overflow-hidden bg-gray-800 py-24 sm:py-32">
        <img
          alt="Chat Background"
          src="https://png.pngtree.com/background/20230617/original/pngtree-floating-chat-bubbles-surrounding-3d-rendered-smartphone-picture-image_3704133.jpg"
          className="absolute inset-0 -z-10 opacity-25 size-full  object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="aspect-1097/845 w-[68.5625rem] bg-linear-to-tr from-[#ff4694] to-[#776fff] opacity-20"
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">Welcome to ChatHub</h2>
            <p className="mt-8 text-lg font-medium text-gray-300 sm:text-xl">
              Connect with friends, colleagues, and family in one place. Stay up-to-date with real-time messaging.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base/7 font-semibold text-white sm:grid-cols-2 md:flex lg:gap-x-10">
              {links.map((link) => (
                <a key={link.name} href={link.href} className="hover:text-indigo-400">
                  {link.name} <span aria-hidden="true">&rarr;</span>
                </a>
              ))}
            </div>

            <div className="mt-16 sm:mt-20">
              <h3 className="text-2xl font-semibold text-white">Recent Conversations</h3>
              <div className="mt-4 space-y-4">
                {recentChats.map((chat) => (
                  <div key={chat.name} className="p-4 bg-gray-700 rounded-lg shadow-lg">
                    <p className="text-xl font-medium text-white">{chat.name}</p>
                    <p className="text-sm text-gray-300">{chat.lastMessage}</p>
                    <p className="text-xs text-gray-500">{chat.time}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 sm:mt-20">
              <h3 className="text-2xl font-semibold text-white">Trending Topics</h3>
              <div className="mt-4 space-y-4">
                {trendingTopics.map((topic) => (
                  <div key={topic.name} className="p-4 bg-gray-700 rounded-lg shadow-lg">
                    <p className="text-xl font-medium text-white">{topic.name}</p>
                    <p className="text-sm text-gray-300">{topic.messages}</p>
                    <p className="text-xs text-gray-500">{topic.time}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 sm:mt-20">
              <h3 className="text-2xl font-semibold text-white">What Users Are Saying</h3>
              <div className="mt-4 space-y-4">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.name} className="p-4 bg-gray-700 rounded-lg shadow-lg">
                    <p className="text-xl font-medium text-white">"{testimonial.message}"</p>
                    <p className="text-sm text-gray-300">- {testimonial.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 sm:mt-20">
              <h3 className="text-2xl font-semibold text-white">Start New Conversation</h3>
              <div className="mt-4">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex justify-between">
            <div className="flex space-x-8">
              <a href="/about" className="hover:text-indigo-400">About</a>
              <a href="/terms" className="hover:text-indigo-400">Terms of Service</a>
              <a href="/privacy" className="hover:text-indigo-400">Privacy Policy</a>
            </div>
            <div>
              <p className="text-sm text-gray-500">© 2025 ChatHub. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
