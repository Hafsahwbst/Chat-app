import User from "../Models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createRefreshToken, createSecretToken } from "../util/SecretToken.js";
dotenv.config();

export const Signup = async (req, res, next) => {
  try {
    const { email, password, username, createdAt } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = await User.create({ email, password, username, createdAt });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    console.error(error);
  }
};

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.json({ message: "All fields are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Incorrect password or email" });
    }

    // Compare the provided password with the stored hashed password
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: "Incorrect password or email" });
    }

    // Create access token and refresh token
    const Token = createSecretToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    // Store the refresh token in a cookie (optional: secure and HttpOnly)
    res.cookie('refresh_token', refreshToken, {
      withCredentials: true,
      httpOnly: false,  // Set to true for added security if necessary
    });

    // Store the access token in a cookie
    res.cookie('token', Token, {
      withCredentials: true,
      httpOnly: false,  // Set to true for added security if necessary
    });

    // Send the response with the access token and user info
    return res.json({ 
      status: true, 
      Token, 
      user: user.username, 
      avatar: user.avatar 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" }); // Handle errors
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "10m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP_EMAIL,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.log("Error verifying transport:", error);
        return res.status(500).send({
          message: "Failed to connect to email service. Check credentials.",
        });
      } else {
        console.log("Email service is ready to send messages");
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: "Reset Password",
      html: `<h1>Reset Your Password</h1>
        <p>Click on the following link to reset your password:</p>
        <a href="http://localhost:3000/reset-password/${token}">Reset password here</a>
        <p>The link will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Error sending email:", err);
        return res.status(500).send({ message: err.message });
      }
      res.status(200).send({ message: "Email sent" });
    });
  } catch (err) {
    console.log("Error in forgetPassword function:", err);
    res.status(500).send({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    // Verify the token sent by the user
    const decodedToken = jwt.verify(
      req.params.token,
      process.env.JWT_SECRET_KEY
    );

    // If the token is invalid, return an error
    if (!decodedToken) {
      return res.status(401).send({ message: "Invalid token" });
    }

    // find the user with the id from the token
    const user = await User.findOne({ _id: decodedToken.userId });
    if (!user) {
      return res.status(400).send({ message: "no user found" });
    }

    // Hash the new password
    // const salt = await bycrypt.genSalt(10);
    // req.body.newPassword = await bycrypt.hash(req.body.newPassword, salt);

    // Update user's password, clear reset token and expiration time
    user.password = req.body.newPassword;
    await user.save();

    // Send success response
    res.status(200).send({ message: "Password updated" });
  } catch (err) {
    // Send error response if any error occurs
    res.status(500).send({ message: err.message });
  }
};

