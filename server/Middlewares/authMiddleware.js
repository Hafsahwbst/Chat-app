import User from "../Models/userModel.js";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { createSecretToken } from "../util/SecretToken.js";

export const userVerification = async (req, res, next) => {
  const token = req?.cookies.token; 
  
  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const user = await User.findById(decoded.id); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
 
   req.user = user; // Attach user info to the request object
    next(); // Call the next middleware (or route handler)
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies.refresh_token;  

  if (!refreshToken) {
    return res.status(401).json({ status: false, message: 'No refresh token found' });
  }

  // Verify refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.status(403).json({ status: false, message: 'Invalid or expired refresh token' });
    }

    // Create a new access token
    const newAccessToken = createSecretToken(data.id);

    // Send the new access token to the client
    res.json({ status: true, accessToken: newAccessToken });
  });
};
