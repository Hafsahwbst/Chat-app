import express from 'express'
import { userVerification } from '../Middlewares/authMiddleware.js';
import { allMessages, deleteMsg, sendMessage } from '../Controller/messageController.js';
const router = express.Router()


router.get("/fetch-message/:chatId",userVerification, allMessages);
router.get("/delete-message/:chatId",userVerification, deleteMsg);
router.post("/message",userVerification, sendMessage);

export default router