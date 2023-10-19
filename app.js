import express from 'express';
const app = express();
const port = 5000; // You can change the port as needed

import router from './routes/api.js';

app.use(express.json()); //decoding json from request to parse in the function
app.use('/api',router);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




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
