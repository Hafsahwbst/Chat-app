import { useAppContext } from '@/Context/AppProvider';
import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';

const ProfileModal = ({ children }) => {
  const { user } = useAppContext();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <>
      {children ? (
        <span onClick={() => setModalIsOpen(true)}>{children}</span>
      ) : (
        <button
          className="btn btn-ghost p-0"
          onClick={() => setModalIsOpen(true)}
        >
          <FaEye className="text-xl" />
        </button>
      )}

      {modalIsOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            {user ? (
              <div className="flex items-center justify-center flex-col">
                <p className="text-4xl my-4 font-semibold">{user.username}</p>
                <img
                  src={user.avatar && `http://localhost:5000/${user.avatar}`}
                  className='w-28 rounded-full'
                  alt={user.username}
                />
                <p className="text-3xl my-4">Email : {user.email}</p>
                <button
                  className="btn btn-error mt-4"
                  onClick={() => setModalIsOpen(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;
