// importing
import express from "express";
import mongoose from "mongoose";
import Pusher from "pusher";
import cors from "cors";


//custom imports
import Message from "./db/message.js";
import User from "./db/user.js";
import Channel from "./db/channel.js";

//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1159193",
    key: "8c48a8d77ce7fc349e7b",
    secret: "a0e7d22ef9d29d09fb2d",
    cluster: "ap2",
    useTLS: true
});


//middleware
app.use(express.json());
app.use(cors());

//DB config
const connection_url = "mongodb+srv://chirag:chirag30@cluster0.qvesn.gcp.mongodb.net/whatchat?retryWrites=true&w=majority";
mongoose.connect(connection_url,{
    // useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
});

const db = mongoose.connection;
db.once('open',()=>{
    console.log("DB connected")
    const msgCollection = db.collection('messages');
    const changeStream = msgCollection.watch();

    changeStream.on('change',(change)=>{
       
        
        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('message','insert',{
                name:messageDetails.name,
                message:messageDetails.message,
                received:messageDetails.received,

            })
        } else {
            console.log("error triggering the pusher",change.operationType);
        }
    })
})

//??


//app routes 
app.get('/',(req,res)=>{
    res.status(200).send("hello world")
})

//
app.get('/messages/sync',(req,res)=>{
    Message.find({},(err,data)=>{
        if(err){
            res.status(500).send(err);
            return;
        }
        
        res.status(200).send(data);
    })
})

app.post('/messages/new',(req,res)=>{
    const message = req.body;

    Message.create(message,(err,data)=>{
        if(err){
            res.status(500).send(err);
        } else{
            res.status(201).send(data);
        }
    })

})
//message channels
app.post('/createChannel',(req,res) => {
    // console.log(req.body)
    
    User.findOne({username:req.body.username},(err,data) => {
        console.log(data)
        for(let i = 0 ; i < data.channels.length; i++){
            if(data.channels[i].name === req.body.sender){
                console.log('already made')
                break;
            }
        }
        if(err) {
            console.log(err);
        }else{
            if(!data){
                res.send(false);
            }else{
                console.log(data)
            }
            Channel.create({
                users:[data.username,req.body.sender],
                
            },(err,channel) => {
                if(err){
                    console.log(err);
                }else{
                    data.channels.push({id:channel._id,name:req.body.sender});
                    data.save();

                }
                User.findOne({username:req.body.sender},(err,data) => {
                    data.channels.push({name:req.body.username,id:channel._id});
                    data.save(); 

                })
            })
        }
    })
})

//userAuth
app.post('/signIn',(req,res) => {
    User.findOne(req.body,(err,data) => {
        if(err) {
            console.log(err);
        } else
            res.send(data)
        
    })
})
app.post('/signUp',(req,res)=>{
    User.findOne({username:req.body.username},(err,data) => {
        if(err){
            console.log(err);
            return;
        }
        if(data){
            res.send(false);
        }else{
            const user = {...req.body, 
                channels:[]
            }
            console.log(user)
            User.create(user,(err) => {
                if(err){
                    console.log(err);
                }else{
                    res.send(true);
                }
            })
        }

    })
    
})

//listen
app.listen(port,()=>{
    console.log(`listening on ${port}`);
})
