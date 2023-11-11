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

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

const app = express();
const server = http.createServer(app);
const io = new Server(server);


io.on('connection', (socket) => {
    console.log('user connected');
    console.log(socket.id, "has joined");
    socket.on('data-stream', (param) => {
        console.log(param);
        streamChat(socket, param);
    })
});


const port = process.env.PORT; // You can change the port as needed
dotenv.config();
const db_connect = process.env.DB_CONNECT;

app.use(express.json()); //to parse parse json
app.use(cors());


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



