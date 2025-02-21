import mongoose from 'mongoose';

const db = async () => {
  const url = process.env.MONGO_URL;
  
  try {
    await mongoose.connect(url);
    console.log("Database connected successfully");
  } catch (err) {
    console.log(err);
  }
};

export default db;
