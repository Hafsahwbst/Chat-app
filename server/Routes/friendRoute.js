import express from 'express'
import { acceptFriendRequest, allusers, declineFriendRequest, deleteRequest, getAllFriends, recievedRequests, sendFriendRequest } from '../Controller/friendController.js'
import { userVerification } from '../Middlewares/authMiddleware.js'

const router = express.Router()

router.get("/all", allusers)
router.post("/send-request", userVerification,sendFriendRequest)
router.post("/accept-request", userVerification,acceptFriendRequest)
router.post("/decline-request", userVerification,declineFriendRequest)
router.get("/recieve-request", userVerification,recievedRequests)
router.get("/all-friends", userVerification,getAllFriends)
router.delete("/delete-friend", userVerification,deleteRequest)



export default router