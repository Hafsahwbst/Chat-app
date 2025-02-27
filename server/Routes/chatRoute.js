import express from 'express'
import { accessChat, addToGroup, createGroupChat, deleteGroupChat, fetchChats, removefromGroup, renameGroup, voiceMessage } from '../Controller/chatController.js'
import { userVerification } from '../Middlewares/authMiddleware.js'
import { voiceUpload } from '../Middlewares/multerSetup.js'
const router = express.Router()

router.post("/access-chat", userVerification , accessChat)
router.get("/fetch-chat", userVerification,fetchChats)
router.post("/group",userVerification, createGroupChat)
router.put("/rename-group",userVerification, renameGroup)
router.put("/add-to-group",userVerification, addToGroup)
router.put("/remove-from-group",userVerification, removefromGroup)
router.delete("/delete-group",userVerification, deleteGroupChat)
router.post('/upload-voice-message', voiceUpload.single('audio'), voiceMessage);


export default router