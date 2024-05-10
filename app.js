import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import http from "http";
import askRouter from './routes/ask-queries.js';
import authRouter from './routes/auth.js';
import routes from './routes/route.js';
import { Server } from 'socket.io';
import OpenAI from "openai";
import { streamChat } from './controllers/streamController.js';
import { turboStreamChat } from './controllers/turboStreamController.js';
import { stripeWebhook } from './controllers/stripeController.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
// Create a new namespace for the second socket
const chatSocket = io.of('/chat-socket');


app.use('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //to parse parse json
app.use(cors());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

const port = process.env.PORT; // You can change the port as needed
dotenv.config();
const db_connect = process.env.DB_CONNECT;



//socket IO
io.on('connection', (socket) => {
    console.log('user connected');
    console.log(socket.id, "has joined");
    socket.on('data-stream', (param) => {
        turboStreamChat(socket, param);
    })
});


// Second socket connection
chatSocket.on('connection', (socket) => {
    console.log('user connected to GPT3.5 chat socket');
    console.log(socket.id, "has joined the GPT3.5 chat socket");
    socket.on('data-stream', (param) => {
        streamChat(socket, param);
    });
});

//Routes 

app.use('/ask-queries', askRouter);
app.use('/auth',authRouter);
app.use('/',routes);


// Error handling
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