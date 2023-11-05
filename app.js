import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import http from "http";
import askRouter from './routes/ask-queries.js';
import authRouter from './routes/auth.js';
import routes from './routes/route.js';

//const server = http.createServer();

const port = process.env.PORT; // You can change the port as needed
dotenv.config();
const db_connect = process.env.DB_CONNECT;

app.use(express.json()); //to parse parse json
app.use(cors());

app.use('/ask-queries',askRouter);
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
        app.listen(port, () => {
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
