
import React  from 'react'
import { FaEye } from 'react-icons/fa'

const Profilemodal  = ({ user,children }) => {

  return (
<>
{children ? (
        <span >{children}</span>
      ) : (
        <button
          className="btn btn-ghost p-0"

        >
          <FaEye className="text-xl" />
        </button>
      )}
{user ? (
<div className="conatiner flex items-center justify-center flex-col">
    <p className="text-4xl my-4 font-semibold">{user.username}</p>
    <img src={user.avatar && `http://localhost:5000/${user.avatar}`} className='w-28 rounded-full' alt={user.username} />
    <p className="text-3xl my-4">Email : {user.email}</p>
</div>
):(
    <p>Loading</p>
)}
</>
  )
}

export default Profilemodal 