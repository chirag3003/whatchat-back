import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    username:String,
    password:String,
    channels:[{
        name:String,
        channelId:String
    }],
})


export default mongoose.model('user',userSchema);