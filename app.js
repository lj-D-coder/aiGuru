import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import askQueries from './routes/ask-queries.js';
import {Users} from './models/usersModel.js';

const app = express();
const port = 5000; // You can change the port as needed
dotenv.config();
const db_connect = process.env.DB_CONNECT;

app.use(express.json()); //decoding json from request to parse in the function
app.use(cors());
app.use('/ask-queries',askQueries);

app.post('/users',async(req,res)=>{
    try {
        if(
            !req.body.name || 
            !req.body.email || 
            !req.body.phoneNo
        ) {
            return response.status(400).send(
                {
                    message: "send all required feilds: name, email, phoneNo",
                });
        }

        const newUser = {
            name: req.body.name,
            email: req.body.email,
            phoneNo: req.body.phoneNo,

        };
        const user = await Users.create(newUser);
        return res.status(201).send(user);
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send({message: error.message});
    }

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
