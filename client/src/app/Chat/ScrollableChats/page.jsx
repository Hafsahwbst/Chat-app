import { iseSameSenderMargin, isLastMessage, isSameSender, isSameUser } from '@/app/config/ChatLogics/page';
import React from 'react';
import ScrollableFeed from 'react-scrollable-feed';

const ScrollableChats = ({ message, user, isGroupChat }) => {
  // If message is empty or undefined, return a placeholder
  if (!message || message.length === 0) {
    return <div>No message to display</div>;
  }

  return (
    <div className="w-full h-full">
      <ScrollableFeed>
        {message.map((msg, i) => {
          const isUserMessage = msg.sender[0]._id.toString() === user._id.toString(); // Access sender ID correctly
          return (
            <div
              key={msg._id}
              className={`${isUserMessage ? 'flex justify-end' : 'flex justify-start'
                } mb-2`} // Align message based on sender
            >
              {/* Show avatar only for the first message or the last message of the sender */}
              {/* {(isFirstMsgOfSender || isLastMsg) && !isUserMessage && (
                <div className="avatar mr-2">
                  <div className="w-12 h-12 rounded-full">
                    <div className="tooltip tooltip-bottom" data-tip={msg.sender[0].username}>
                      <button className="btn">
                        <img
                          src={msg.sender[0].avatar ? `http://localhost:5000/${msg.sender[0].avatar}` : 'https://static.vecteezy.com/system/resources/previews/009/734/564/non_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg'}
                          alt={msg.sender[0].username}
                          className="rounded-full w-full h-full object-cover"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Message */}

            
              <div
                className={`${isUserMessage ? 'items-start' : 'items-end'
                  }flex-1   `}
                style={{
                  display: 'flex',
                  flexDirection: 'column',


                }}
              >
                  {isGroupChat && msg.sender && msg.sender[0] && msg.sender[0].username && (
                <div className="chat-sender-name text-sm text-gray-400 ">
                  {msg.sender[0].username}
                </div>
              )}
                <div
                  className={`${isUserMessage ? 'bg-blue-400' : 'bg-gray-400'
                    } text-white p-3 rounded-xl  `}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </ScrollableFeed>
    </div>
  );
};

export default ScrollableChats;
