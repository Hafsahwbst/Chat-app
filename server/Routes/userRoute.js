// routes/userRoutes.js
import express from 'express';
const router = express.Router()
import { allusers, uploadFile } from '../Controller/userController.js'
import { authoriseUser, deleteProfile, getProfile, updateProfile } from '../Controller/userController.js'
import { userVerification } from '../Middlewares/authMiddleware.js';
import upload from '../Middlewares/multerSetup.js';

router.get('/user', userVerification , getProfile);
router.put('/update-profile', userVerification , updateProfile);
router.delete('/delete-profile', userVerification , deleteProfile);
router.get("/authorise" , userVerification , authoriseUser)
router.post("/upload", upload.single("file"), uploadFile)
router.get("/all",userVerification, allusers)

export default router