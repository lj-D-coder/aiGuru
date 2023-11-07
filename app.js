import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import http from "http";
import askRouter from './routes/ask-queries.js';
import authRouter from './routes/auth.js';
import routes from './routes/route.js';
import { Server } from 'socket.io';
import { streamData } from './controllers/streamController.js';


const app = express();
const server = http.createServer(app);
const io = new Server(server);

 const streamChat = async () => {
    console.log("calling Stream Data");
        
    const completion = await openai.chat.completions.create({
              messages: [{ role: 'user', content: "test" }],
              model: 'gpt-3.5-turbo',
              stream: true,
              max_tokens:500,
    });
    
    let arr_answer = [];
      for await (const chunk of completion) {
        if (chunk === undefined) return;
        arr_answer.push(chunk.choices[0].delta.content);
          console.clear();
          socket.emit('answer-stream', () => {
              JSON.stringify(chunk.choices[0].delta.content);
        })
        //res.write(`data: ${JSON.stringify(chunk.choices[0].delta.content)}\n\n`);
      }
};

io.on('connection', (socket) => {
    console.log('user connected');
    console.log(socket.id, "has joined");
    socket.on('data-stream', (msg) => {
        console.log(msg); 
        streamChat();
    })
});




const port = process.env.PORT; // You can change the port as needed
dotenv.config();
const db_connect = process.env.DB_CONNECT;

app.use(express.json()); //to parse parse json
app.use(cors());


//app.post('/stream', streamData(io));

app.use('/ask-queries', askRouter);
app.use('/auth',authRouter);
app.use('/',routes);

app.use((err, req, res, next) =>{
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status (statusCode).json ({
    success: false,
    statusCode,
    message,
    });
});


mongoose
    .connect(db_connect)
    .then(()=>{
        console.log('App connected  to database');
        server.listen(port,"0.0.0.0", () => {
            console.log(`Server is running on port ${port}`);
          });
    })
    .catch((error)=>{
        console.log(error);
    })



// app.get
// app.post
// app.put -- update
// app.delete
// app.all
// app.use -- middleware
// app.listen

/** 
app.get('/',(req, res)=>{
    res.status(200).send("Home page");
});

app.get('/about',(req, res)=>{
    res.send("About Page");
});

app.all('*',(req, res)=>{
    res.status(404).send("<h1>Resource Not found</h1>");
});


app.listen(5000, ()=>{
    console.log("server is running on port 5000...")
});

*/

// const http = require('http');

// const server = http.createServer((req, res)=>{
//     res.end("Hello world");
// });


// server.listen(5000, ()=>{
//     console.log("server listening on port: 5000...");
// });
