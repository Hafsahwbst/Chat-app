// routes/userRoutes.js
import express from 'express';
import { verifyToken } from '../util/SecretToken.js';
const router = express.Router()
import upload from '../Middlewares/multerSetup.js'
import { allusers, uploadFile } from '../Controller/userController.js'
import { authoriseUser, deleteProfile, getProfile, updateProfile } from '../Controller/userController.js'

router.get('/user', verifyToken , getProfile);
router.put('/update-profile', verifyToken , updateProfile);
router.delete('/delete-profile', verifyToken , deleteProfile);
router.get("/authorise" , verifyToken , authoriseUser)
router.post("/upload", upload.single("file"), uploadFile)
router.get("/all",verifyToken, allusers)

export default router