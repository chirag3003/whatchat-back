import mongoose from "mongoose";


const messgaeSchema = mongoose.Schema({
    message: String,
    name: String, 
    timestamp:String,
    received:Boolean, 
})


export default mongoose.model("message",messgaeSchema);