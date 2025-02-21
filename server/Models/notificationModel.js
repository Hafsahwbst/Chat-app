import mongoose from "mongoose";

const notificationScehma = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId , ref:"User"
    },
    receiver:{
        type:String
    },
    message:{
        type:String
    }
})

const Notification = mongoose.model("Notification",notificationScehma)
export default Notification