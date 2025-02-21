import bcrypt from "bcryptjs";
import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    email: {
      type: String,
      required: [true, "Your email address is required"],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Your username is required"],
    },
    password: {
      type: String,
      required: [true, "Your password is required"],
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    newPassword: String,
    avatar: {
      type: String,
      default:
        "avatar.jpg",
    },
    role: {
      type: String,
      default: "user",
    },
    gender: {
      type: String,
    },
    phoneNo:{
      type:Number,
      default:9876543210
    },
    address: {
      type: String,
      default: "",
    },
  bio:{
    type:String,
    default:""
  }
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password before saving to the DB
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // Hash password only if it's modified
    try {
      this.password = await bcrypt.hash(this.password, 12);
      next(); // Proceed with saving
    } catch (error) {
      next(error); // Pass error to next middleware if hashing fails
    }
  } else {
    next(); // Proceed with saving if password is not modified
  }
});

// Instance method to verify password
userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error("Password verification failed.");
  }
};

const User = mongoose.model("User", userSchema);

export default User;
