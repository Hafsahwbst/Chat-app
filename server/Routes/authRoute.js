import { Signup, Login,  resetPassword, forgetPassword } from '../Controller/authController.js'
import express from 'express'
import { refreshAccessToken, userVerification } from '../Middlewares/authMiddleware.js'
const router = express.Router()

router.post('/signup',Signup)
router.post('/login',Login)
router.get('/auth',userVerification)
router.post("/forgetPassword", forgetPassword);
router.post('/refresh', refreshAccessToken);
router.put("/reset-password/:token", resetPassword);

export default router
