import mongoose from "mongoose";


const channelScema = new mongoose.Schema({
    users:[String],
    messages:[{
        message: String,
        name: String, 
        timestamp:String,
        sender:String, 
    }]
})

export default mongoose.model("channel",channelScema);