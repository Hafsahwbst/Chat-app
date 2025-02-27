'use client'

export const getSender = (loggedUser, users) => {
  if (users && users?.length > 0 && users[0]?._id === loggedUser?._id) {
    return users[1]?.username;
  } else {
    return (users && users?.length > 0 )? users[0]?.username:'';
  }
};

export const getSenderFull = (loggedUser, users) => {
  if (users && users?.length > 0 && users[0]?._id === loggedUser?._id) {
    return users[1]?.username;
  } else {
    return (users && users)? users[0]?.username:''
  }

}

export const isSameSender = (message, msg, i, userId) => {
  // Check if message[i + 1] exists and has a sender property
  if (!message[i + 1]) return false;

  return (
    i < message.length - 1 && message[i + 1].sender._id !== msg.sender._id
  );
};

export const isLastMessage = (message, i, userId) => {
  return (
    i === message.length - 1 &&
    message[message.length - 1].sender._id !== userId
  );
};

export const iseSameSenderMargin = (message, msg, i, userId) => {  
  if (
    i < message.length - 1 &&
    message[i + 1].sender._id !== msg.sender._id &&
    message[i].sender._id !== userId
  ) {
    return 33;
  } else if (
    (i === message.length - 1 && message[i].sender._id !== userId) ||
    (i < message.length - 1 && message[i + 1].sender._id !== msg.sender._id)
  ) {
    return 0;
  }
  return 'auto';
};

export const isSameUser = (messages, msg, i) => {
  // Check if there is a previous message and if it's from the same sender
  return i > 0 && messages[i - 1].sender._id === msg.sender._id;
};

export const isSameSenderMargin = (messages, msg, i, userId) => {
  // If the current message is followed by a message from the same sender and it's not the user's message
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === msg.sender._id &&
    msg.sender._id !== userId
  ) {
    return 33; // Set a margin when same sender follows and it's not the current user
  }
  
  // If the current message is followed by a message from a different sender (or if it's the last message)
  // and the current message is not from the user, return no margin
  else if (
    (i < messages.length - 1 && messages[i + 1].sender._id !== msg.sender._id && msg.sender._id !== userId) ||
    (i === messages.length - 1 && msg.sender._id !== userId)
  ) {
    return 0; // No margin
  }
  
  // Otherwise, automatically handle margin based on layout and message owner
  else {
    return 'auto'; // This can be replaced with null or undefined for clarity if needed
  }
};
